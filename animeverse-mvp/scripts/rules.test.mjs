/**
 * Rules verification for firestore.rules and storage.rules against the local
 * Firebase emulators. These assert the actual access boundary:
 *
 *   - anonymous / signed-in-without-claim => NO write
 *   - admin claim => write allowed
 *
 * Run with the emulators already up:
 *   node scripts/rules.test.mjs
 *
 * or let it manage them:
 *   npm run test:rules
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp, deleteApp } from "firebase/app";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EMULATOR_CONFIG = JSON.parse(
  fs.readFileSync(path.join(ROOT, "firebase.json"), "utf8")
).emulators;

const FS_PORT = EMULATOR_CONFIG.firestore.port;
const ST_PORT = EMULATOR_CONFIG.storage.port;
const HOST = "127.0.0.1";

const PROJECT = "anime-museum";
const API_KEY = "demo-key-for-emulator-only";

const results = [];
let failures = 0;

async function check(name, fn) {
  try {
    await fn();
    results.push(`  PASS  ${name}`);
  } catch (err) {
    failures += 1;
    results.push(`  FAIL  ${name}\n          ${err.message.split("\n")[0]}`);
  }
}



async function main() {
  const storageApp = initializeApp(
    { apiKey: API_KEY, projectId: PROJECT, appId: "storage-client" },
    "storage-client"
  );
  const storage = getStorage(storageApp);
  connectStorageEmulator(storage, HOST, ST_PORT);

  // Emulators do not evaluate custom claims from a fake token unless the client
  // sends them, so we drive the rules through the emulator's REST surface with
  // an explicit Authorization header. That is what actually exercises
  // request.auth.token.admin in the rules.
  const fsUrl = `http://${HOST}:${FS_PORT}/v1/projects/${PROJECT}/databases/(default)/documents`;
  const { idToken } = await makeTokens();

  const authHeader = (t) => ({ Authorization: `Bearer ${t}` });

  console.log("\nFirestore rules");
  console.log("===============");

  await check("anonymous can READ the characters collection", async () => {
    const r = await fetch(`${fsUrl}/characters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ structuredQuery: { from: [{ collectionId: "characters" }] } }),
    });
    assert.equal(r.status, 200, `expected 200, got ${r.status}`);
  });

  await check("anonymous CANNOT create a character", async () => {
    const r = await fetch(`${fsUrl}/characters?documentId=anon-1`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: { name: { stringValue: "anon" }, modelUrl: { stringValue: "u" } } }),
    });
    assert.equal(r.status, 403, `expected 403, got ${r.status}`);
  });

  await check("signed-in user WITHOUT admin claim CANNOT create", async () => {
    const r = await fetch(`${fsUrl}/characters?documentId=plain-1`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeader(idToken.plain) },
      body: JSON.stringify({ fields: { name: { stringValue: "plain" }, modelUrl: { stringValue: "u" } } }),
    });
    assert.equal(r.status, 403, `expected 403, got ${r.status}`);
  });

  await check("admin claim CAN create a character", async () => {
    const r = await fetch(`${fsUrl}/characters?documentId=admin-ok-1`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeader(idToken.admin) },
      body: JSON.stringify({ fields: { name: { stringValue: "Goku" }, modelUrl: { stringValue: "http://x/y.glb" } } }),
    });
    assert.equal(r.status, 200, `expected 200, got ${r.status} ${await r.text()}`);
  });

  await check("admin claim CAN update", async () => {
    const r = await fetch(`${fsUrl}/characters/admin-ok-1`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeader(idToken.admin) },
      body: JSON.stringify({ fields: { animeTitle: { stringValue: "DBZ" } } }),
    });
    assert.equal(r.status, 200, `expected 200, got ${r.status}`);
  });

  await check("admin claim CAN delete", async () => {
    const r = await fetch(`${fsUrl}/characters/admin-ok-1`, {
      method: "DELETE",
      headers: authHeader(idToken.admin),
    });
    assert.equal(r.status, 200, `expected 200, got ${r.status}`);
  });

  await check("admin claim CANNOT create a character missing name (validation)", async () => {
    const r = await fetch(`${fsUrl}/characters?documentId=bad-1`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeader(idToken.admin) },
      body: JSON.stringify({ fields: { modelUrl: { stringValue: "http://x/y.glb" } } }),
    });
    assert.equal(r.status, 403, `expected 403, got ${r.status}`);
  });

  await check("unrelated path is denied even for admin (default deny)", async () => {
    const r = await fetch(`${fsUrl}/secrets/documentId=x`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeader(idToken.admin) },
      body: JSON.stringify({ fields: { a: { stringValue: "b" } } }),
    });
    assert.equal(r.status, 403, `expected 403, got ${r.status}`);
  });

  console.log("\nStorage rules");
  console.log("==============");

  const stUrl = `http://${HOST}:${ST_PORT}/v0/b/${PROJECT}.appspot.com/o`;

  await check("anonymous CANNOT upload to /models", async () => {
    const r = await fetch(`${stUrl}?uploadType=media&name=models/anon.glb`, {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
      body: "not-a-real-glb",
    });
    assert.ok(r.status === 403 || r.status === 401, `expected 401/403, got ${r.status}`);
  });

  await check("admin claim CAN upload to /models", async () => {
    const r = await fetch(`${stUrl}?uploadType=media&name=models/admin-ok.glb`, {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream", ...authHeader(idToken.admin) },
      body: "fake-glb-bytes",
    });
    assert.equal(r.status, 200, `expected 200, got ${r.status} ${await r.text()}`);
  });

  await check("anonymous CAN read /models (public gallery)", async () => {
    const r = await fetch(`${stUrl}?alt=media&name=models/admin-ok.glb`);
    assert.equal(r.status, 200, `expected 200, got ${r.status}`);
  });

  await check("signed-in WITHOUT claim CANNOT upload", async () => {
    const r = await fetch(`${stUrl}?uploadType=media&name=models/plain.glb`, {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream", ...authHeader(idToken.plain) },
      body: "fake",
    });
    assert.equal(r.status, 403, `expected 403, got ${r.status}`);
  });

  await check("admin claim CAN delete", async () => {
    const r = await fetch(`${stUrl}?name=models/admin-ok.glb`, {
      method: "DELETE",
      headers: authHeader(idToken.admin),
    });
    assert.equal(r.status, 200, `expected 200, got ${r.status} ${await r.text()}`);
  });

  await check("path outside /models is denied even for admin", async () => {
    const r = await fetch(`${stUrl}?uploadType=media&name=other/evil.glb`, {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream", ...authHeader(idToken.admin) },
      body: "fake",
    });
    assert.ok(r.status === 403 || r.status === 404, `expected 403/404, got ${r.status}`);
  });

  console.log(results.join("\n"));
  console.log(
    `\n${results.length - failures}/${results.length} rules checks passed\n`
  );

  await deleteApp(storageApp).catch(() => {});
  process.exit(failures === 0 ? 0 : 1);
}

/**
 * Mint unsigned ID tokens the emulator will accept, carrying the claims we
 * want the rules to see. The Firestore emulator accepts structurally-valid but
 * unsigned JWTs when rules only inspect auth state.
 */
async function makeTokens() {
  const b64 = (obj) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");

  const mint = (uid, claims) => {
    const header = { alg: "none", typ: "JWT" };
    const payload = {
      iss: `https://securetoken.google.com/${PROJECT}`,
      aud: PROJECT,
      sub: uid,
      user_id: uid,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      ...claims,
    };
    return `${b64(header)}.${b64(payload)}.`;
  };

  return {
    idToken: {
      plain: mint("plain-user-uid", { email: "plain@example.com" }),
      admin: mint("admin-user-uid", {
        email: "admin@example.com",
        admin: true,
      }),
    },
  };
}

main().catch((err) => {
  console.error("\nRules test harness crashed:", err);
  process.exit(1);
});