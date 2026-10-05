// ---------------------------------------------------------------------------
// SSRF guard for the /proxy HLS relay.
//
// That endpoint exists only to relay public HLS media, so it must never be
// usable to reach hosts the public internet cannot: loopback, RFC1918,
// link-local / cloud-metadata (169.254.169.254), CGNAT, or IPv6 equivalents.
//
// Kept in its own module so it can be unit-tested without booting the
// AnimePahe provider's network probes in index.js.
// ---------------------------------------------------------------------------

const dns = require('dns').promises;
const net = require('net');

const MAX_PROXY_REDIRECTS = 3;
const MAX_PROXY_BYTES = 32 * 1024 * 1024;
const PROXY_TIMEOUT_MS = 20000;

const REJECT_INVALID_URL = 'Invalid URL';
const REJECT_SCHEME = 'Only http(s) URLs may be proxied';
const REJECT_DNS = 'Host could not be resolved';
const REJECT_PRIVATE = 'Target address is not publicly routable';
const REJECT_REDIRECT = 'Redirect target is not publicly routable';

function isBlockedIPv4(ip) {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
        return true; // unparseable -> refuse rather than guess
    }
    const [a, b] = parts;
    if (a === 0) return true;                          // 0.0.0.0/8          "this network"
    if (a === 10) return true;                         // 10.0.0.0/8         private
    if (a === 127) return true;                        // 127.0.0.0/8        loopback
    if (a === 169 && b === 254) return true;           // 169.254.0.0/16     link-local + cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true;  // 172.16.0.0/12      private
    if (a === 192 && b === 168) return true;           // 192.168.0.0/16     private
    if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10      CGNAT
    if (a === 192 && b === 0) return true;             // 192.0.0.0/24       IETF protocol assignments
    if (a >= 224) return true;                         // multicast / reserved / broadcast
    return false;
}

/**
 * Expand an IPv6 address (including ::-compression and zone index) into its
 * eight 16-bit groups. WHATWG URL serialises IPv4-mapped addresses in hex form
 * (::ffff:127.0.0.1 -> ::ffff:7f00:1), so dotted-quad matching is not enough.
 * @returns {number[]|null}
 */
function expandIPv6(ip) {
    let addr = ip.toLowerCase().split('%')[0];

    // Trailing dotted-quad (e.g. ::ffff:127.0.0.1) becomes two 16-bit groups.
    let tail = [];
    const dotted = addr.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
    if (dotted) {
        const o = dotted[1].split('.').map(Number);
        if (o.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
        tail = [(o[0] << 8) | o[1], (o[2] << 8) | o[3]];
        addr = addr.slice(0, dotted.index);
    }

    const halves = addr.split('::');
    if (halves.length > 2) return null; // more than one :: is malformed

    const parse = (part) =>
        part.length ? part.split(':').map((g) => (/^[0-9a-f]{1,4}$/.test(g) ? parseInt(g, 16) : NaN)) : [];

    const head = parse(halves[0]);
    const rest = halves.length === 2 ? parse(halves[1]) : [];
    if ([...head, ...rest].some((g) => Number.isNaN(g))) return null;

    const groups = halves.length === 2
        ? [...head, ...new Array(8 - head.length - rest.length).fill(0), ...rest]
        : head;

    if (groups.length !== 8) return null;
    return [...groups, ...tail].slice(0, 8);
}

function isBlockedIPv6(ip) {
    const g = expandIPv6(ip);
    if (!g) return true; // unparseable -> refuse rather than guess

    const isZeroPrefix = g.slice(0, 5).every((x) => x === 0);

    if (g.every((x) => x === 0)) return true;                 // ::    unspecified
    if (isZeroPrefix && g[5] === 0 && g[6] === 0 && g[7] === 1) return true; // ::1   loopback

    // IPv4-mapped (::ffff:0:0/96) and IPv4-compatible (::a.b.c.d) both tunnel v4.
    const isV4Mapped = isZeroPrefix && g[5] === 0xffff;
    const isV4Compat = g.slice(0, 6).every((x) => x === 0);
    if (isV4Mapped || isV4Compat) {
        const v4 = `${g[6] >> 8}.${g[6] & 0xff}.${g[7] >> 8}.${g[7] & 0xff}`;
        return isBlockedIPv4(v4);
    }

    if ((g[0] & 0xfe00) === 0xfc00) return true;  // fc00::/7    unique-local
    if (g[0] >= 0xfe80 && g[0] <= 0xfebf) return true; // fe80::/10  link-local
    if (g[0] >= 0xfec0 && g[0] <= 0xfeff) return true; // fec0::/10  site-local (deprecated)
    if (g[0] === 0x0064 && g[1] === 0xff9b) return true;  // 64:ff9b::/96 NAT64
    if (g[0] === 0x0100 && g.slice(1, 4).every((x) => x === 0)) return true; // 100::/64 discard

    return false;
}

function isBlockedAddress(ip) {
    const family = net.isIP(ip);
    if (family === 4) return isBlockedIPv4(ip);
    if (family === 6) return isBlockedIPv6(ip);
    return true; // not an IP at all -> refuse
}

/**
 * Validate a candidate proxy target. Resolves DNS so a hostname cannot be used
 * as a disguise for a private IP, and blocks non-HTTP(S) schemes outright
 * (file:, gopher:, data:, ftp: ...).
 * @param {string} rawUrl
 * @returns {Promise<URL>} the parsed, validated URL
 * @throws {Error} with a message from the REJECT_* constants
 */
async function assertPublicUrl(rawUrl) {
    let parsed;
    try {
        parsed = new URL(rawUrl);
    } catch {
        throw new Error(REJECT_INVALID_URL);
    }

    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        throw new Error(REJECT_SCHEME);
    }

    const host = parsed.hostname.replace(/^\[|\]$/g, '');
    const addresses = net.isIP(host)
        ? [{ address: host }]
        : await dns.lookup(host, { all: true }).catch(() => {
            throw new Error(REJECT_DNS);
        });

    if (!addresses.length || addresses.some((a) => isBlockedAddress(a.address))) {
        throw new Error(REJECT_PRIVATE);
    }

    return parsed;
}

/**
 * Resolve a redirect Location header against the current target and re-validate.
 * @returns {Promise<URL>}
 */
async function resolveRedirect(location, currentTarget) {
    let next;
    try {
        next = new URL(location, currentTarget);
    } catch {
        throw new Error(REJECT_REDIRECT);
    }
    try {
        return await assertPublicUrl(next.toString());
    } catch {
        throw new Error(REJECT_REDIRECT);
    }
}

module.exports = {
    assertPublicUrl,
    resolveRedirect,
    isBlockedAddress,
    isBlockedIPv4,
    isBlockedIPv6,
    MAX_PROXY_REDIRECTS,
    MAX_PROXY_BYTES,
    PROXY_TIMEOUT_MS,
    REJECT_INVALID_URL,
    REJECT_SCHEME,
    REJECT_DNS,
    REJECT_PRIVATE,
    REJECT_REDIRECT,
};