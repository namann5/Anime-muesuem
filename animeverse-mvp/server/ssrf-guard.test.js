// Regression tests for server/ssrf-guard.js. Run with: node ssrf-guard.test.js
// Covers the block/allow matrix that the guard must enforce, including the
// WHATWG-hex IPv4-mapped forms that a naive dotted-quad check would miss.
const assert = require('assert');
const {
    assertPublicUrl,
    resolveRedirect,
    isBlockedAddress,
} = require('./ssrf-guard');

const BLOCKED = [
    ['loopback literal',        'http://127.0.0.1:8080/admin'],
    ['loopback alt',            'http://127.1.2.3/x'],
    ['localhost name',          'http://localhost:3001/health'],
    ['cloud metadata',          'http://169.254.169.254/latest/meta-data/'],
    ['link-local alt',          'http://169.254.0.1/'],
    ['rfc1918 10/8',            'http://10.0.0.5/'],
    ['rfc1918 172.16/12 low',   'http://172.16.0.1/'],
    ['rfc1918 172.16/12 high',  'http://172.31.255.254/'],
    ['rfc1918 192.168/16',      'http://192.168.1.1/admin'],
    ['cgnat 100.64/10',         'http://100.64.0.1/'],
    ['0.0.0.0',                 'http://0.0.0.0:3001/'],
    ['this-network 0.x',        'http://0.0.0.0/'],
    ['ietf 192.0.0/24',         'http://192.0.0.8/'],
    ['multicast',               'http://239.0.0.1/'],
    ['broadcast',               'http://255.255.255.255/'],
    ['ipv6 loopback',           'http://[::1]:3001/health'],
    ['ipv6 unspecified',        'http://[::]/'],
    ['ipv6 unique-local',       'http://[fc00::1]/'],
    ['ipv6 link-local',         'http://[fe80::1]/'],
    ['ipv4-mapped loopback',    'http://[::ffff:127.0.0.1]/'],
    ['ipv4-mapped hex form',    'http://[::ffff:7f00:1]/'],
    ['ipv4-mapped 10.x',        'http://[::ffff:a00:1]/'],
    ['ipv4-compat loopback',    'http://[::127.0.0.1]/'],
    ['nat64 prefix',            'http://[64:ff9b::7f00:1]/'],
    ['ipv6 site-local',         'http://[fec0::1]/'],
    ['ipv6 discard prefix',     'http://[100::1]/'],
    ['file scheme',             'file:///etc/passwd'],
    ['gopher scheme',           'gopher://127.0.0.1:6379/_INFO'],
    ['data scheme',             'data:text/html,<script>alert(1)</script>'],
    ['ftp scheme',              'ftp://127.0.0.1/x'],
    ['malformed url',           'not-a-url'],
    ['empty host',              'http://'],
    ['dns fail',                'https://this-host-should-not-resolve-9f3a2.invalid/x'],
];

const ALLOWED = [
    ['https public host',       'https://animepahe.com/playlist.m3u8'],
    ['http public host',        'http://93.184.216.34/media.ts'],
    ['public ip direct',        'https://8.8.8.8/x'],
    ['public ipv6',             'https://[2606:4700:4700::1111]/x'],
    ['ipv4-mapped public',      'http://[::ffff:8.8.8.8]/x'],
    ['ipv4-mapped public hex', 'http://[::ffff:808:808]/x'],
    ['cdn with path+query',     'https://animepahe.com/hls/seg1.ts?token=abc&x=1'],
];

(async () => {
    let pass = 0, fail = 0;

    for (const [name, url] of BLOCKED) {
        try {
            await assertPublicUrl(url);
            console.log(`  FAIL  allowed blocked target: ${name}  ${url}`);
            fail++;
        } catch {
            pass++;
        }
    }

    for (const [name, url] of ALLOWED) {
        try {
            await assertPublicUrl(url);
            pass++;
        } catch (err) {
            console.log(`  FAIL  blocked legit target: ${name}  ${url}  -> ${err.message}`);
            fail++;
        }
    }

    // Redirect handling
    const redirectCases = [
        ['public->public ok',   'https://animepahe.com/', '/other.m3u8', true],
        ['public->metadata',    'https://animepahe.com/', 'http://169.254.169.254/', false],
        ['public->localhost',   'https://animepahe.com/', 'http://127.0.0.1/', false],
        ['public->file',        'https://animepahe.com/', 'file:///etc/passwd', false],
        ['abs public->private', 'https://animepahe.com/', 'http://192.168.0.1/', false],
    ];
    for (const [name, base, loc, shouldPass] of redirectCases) {
        let ok = false;
        try { await resolveRedirect(loc, new URL(base)); ok = true; } catch { ok = false; }
        if (ok === shouldPass) pass++;
        else { console.log(`  FAIL  redirect ${name}: expected ${shouldPass ? 'allow' : 'block'}, got ${ok ? 'allow' : 'block'}`); fail++; }
    }

    // Direct address classifier spot checks
    assert.strictEqual(isBlockedAddress('8.8.8.8'), false);
    assert.strictEqual(isBlockedAddress('127.0.0.1'), true);
    assert.strictEqual(isBlockedAddress('::1'), true);
    assert.strictEqual(isBlockedAddress('2606:4700:4700::1111'), false);

    console.log(`\n${fail === 0 ? 'PASS' : 'FAIL'}  ${pass} passed, ${fail} failed`);
    process.exit(fail === 0 ? 0 : 1);
})();