#!/usr/bin/env node
/**
 * Grant (or revoke) the `admin` custom claim on a Firebase Auth user.
 *
 * The `admin` claim is what firestore.rules and storage.rules check before
 * allowing any write. It is set server-side here because the Admin SDK uses the
 * service account, which bypasses the rules themselves; a client can never set
 * a claim on its own token.
 *
 * Usage:
 *   node scripts/set-admin-claim.mjs <admin-email> [--revoke]
 *
 * Requires a service account key. Point at it with either:
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
 *   FIREBASE_SERVICE_ACCOUNT=/path/to/serviceAccountKey.json
 *
 * The key must NOT be committed. Download it from:
 *   Firebase console -> Project settings -> Service accounts
 *   -> "Generate new private key" (gives a .json file to keep locally)
 *
 * Tokens already issued keep their old claims until they expire or the user
 * signs out and back in, so ask the admin to re-login after running this.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const PROJECT_ID = "anime-museum";

function die(msg) {
  console.error(`\nError: ${msg}\n`);
  process.exit(1);
}

function resolveServiceAccountPath() {
  const explicit = process.env.FIREBASE_SERVICE_ACCOUNT;
  const candidates = explicit
    ? [explicit]
    : [
        path.join(ROOT, "serviceAccountKey.json"),
        path.join(ROOT, "service-account-key.json"),
      ];

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) return candidate;
  }

  die(
    "No service account key found.\n" +
      "  Set FIREBASE_SERVICE_ACCOUNT=/path/to/serviceAccountKey.json\n" +
      "  or place the key at " +
      path.join(ROOT, "serviceAccountKey.json") +
      "\n  Download it from Firebase console -> Project settings -> Service accounts."
  );
}

function assertKeyNotCommitted(keyPath) {
  const rel = path.relative(ROOT, keyPath).replace(/\\/g, "/");
  if (!rel.startsWith("..")) {
    let gitignore = "";
    try {
      gitignore = fs.readFileSync(path.join(ROOT, ".gitignore"), "utf8");
    } catch {
      /* no .gitignore; treat as not ignored */
    }
    if (!gitignore.includes(rel.split("/").pop())) {
      console.warn(
        `\nWarning: ${rel} is not matched by .gitignore. Add it before committing.\n`
      );
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const revoke = args.includes("--revoke");
  const email = args.find((a) => !a.startsWith("--"));

  if (!email) {
    die(
      "Missing email argument.\n" +
        "  node scripts/set-admin-claim.mjs you@example.com\n" +
        "  node scripts/set-admin-claim.mjs you@example.com --revoke"
    );
  }
  if (!email.includes("@")) die(`"${email}" is not a valid email address.`);

  const keyPath = resolveServiceAccountPath();
  assertKeyNotCommitted(keyPath);

  let cert, initializeApp, getAuth;
  try {
    ({ cert } = await import("firebase-admin/credential.js"));
    ({ initializeApp } = await import("firebase-admin/app.js"));
    ({ getAuth } = await import("firebase-admin/auth.js"));
  } catch {
    die("firebase-admin is not installed. Run: npm install --save-dev firebase-admin");
  }

  const credential = cert(JSON.parse(fs.readFileSync(keyPath, "utf8")));
  const app = initializeApp({ credential, projectId: PROJECT_ID });
  const auth = getAuth(app);

  let user;
  try {
    user = await auth.getUserByEmail(email);
  } catch (err) {
    if (err && err.code === "auth/user-not-found") {
      die(
        `No Firebase Auth user with email ${email}.\n` +
          "  Create it first in Firebase console -> Authentication -> Users,\n" +
          "  with Email/Password sign-in enabled."
      );
    }
    throw err;
  }

  const wantAdmin = !revoke;

  // setCustomUserClaims REPLACES the entire claims map, so merge rather than
  // overwrite to avoid silently dropping unrelated claims.
  await auth.setCustomUserClaims(user.uid, { ...(user.customClaims || {}), admin: wantAdmin });

  // Force the new claim into the ID token right away.
  await auth.revokeRefreshTokens(user.uid);

  console.log(
    `\n${wantAdmin ? "Granted" : "Revoked"} admin claim for ${email} (uid ${user.uid}).`
  );
  console.log(
    "The admin must sign out and back in so the new claim appears in their ID token."
  );

  await app.delete().catch(() => {});
}

main().catch((err) => {
  console.error("\nUnexpected failure:", err && err.message ? err.message : err);
  process.exit(1);
});