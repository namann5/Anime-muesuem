// End-to-end check that the real Express app rejects internal targets.
// Run with: node proxy.integration.test.js  (first case may be slow: cold DNS
// contends with the provider's concurrent AnimePahe domain probes).
const http = require('http');

const app = require('./index');

function get(path) {
    return new Promise((resolve, reject) => {
        const req = http.get({ host: '127.0.0.1', port: 3999, path }, (res) => {
            let body = '';
            res.on('data', (c) => (body += c));
            res.on('end', () => resolve({ status: res.statusCode, body }));
        });
        req.on('error', reject);
        req.setTimeout(25000, () => req.destroy(new Error('timeout')));
    });
}

const CASES = [
    ['cloud metadata must be blocked', `/api/proxy?url=${encodeURIComponent('http://169.254.169.254/latest/meta-data/iam/security-credentials/')}`, 400],
    ['loopback must be blocked',      `/api/proxy?url=${encodeURIComponent('http://127.0.0.1:3999/health')}`, 400],
    ['localhost name must be blocked',`/api/proxy?url=${encodeURIComponent('http://localhost:3999/health')}`, 400],
    ['rfc1918 must be blocked',       `/api/proxy?url=${encodeURIComponent('http://192.168.0.1/')}`, 400],
    ['file scheme must be blocked',   `/api/proxy?url=${encodeURIComponent('file:///C:/Windows/win.ini')}`, 400],
    ['mapped loopback blocked',       `/api/proxy?url=${encodeURIComponent('http://[::ffff:7f00:1]/')}`, 400],
    ['missing param is 400',          `/api/proxy`, 400],
    ['public url passes guard (502/200 from upstream, NOT 400)', `/api/proxy?url=${encodeURIComponent('https://animepahe.com/')}`, 'not400'],
];

const server = app.listen(3999, async () => {
    let fail = 0;
    for (const [name, path, expect] of CASES) {
        try {
            const r = await get(path);
            let ok;
            if (expect === 'not400') ok = r.status !== 400;
            else ok = r.status === expect;
            const short = r.body.length > 90 ? r.body.slice(0, 90) + '...' : r.body;
            console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name} -> ${r.status}  ${short.replace(/\s+/g, ' ')}`);
            if (!ok) fail++;
        } catch (err) {
            console.log(`  FAIL  ${name} -> ${err.message}`);
            fail++;
        }
    }
    server.close();
    console.log(`\n${fail === 0 ? 'PASS' : 'FAIL'}  integration: ${CASES.length - fail}/${CASES.length} ok`);
    process.exit(fail === 0 ? 0 : 1);
});