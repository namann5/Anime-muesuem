import { loadFirebase } from "../lib/firebase";

/**
 * Sign in as the gallery administrator using Firebase Auth.
 *
 * This is the real access-control boundary. Firestore/Storage writes require an
 * `admin` custom claim on the token (see firestore.rules / storage.rules), and
 * scripts/set-admin-claim.mjs is what mints it.
 *
 * There is deliberately NO build-time password check anywhere in the sign-in
 * path. Vite inlines VITE_* values into the public bundle, so a build-time
 * password would mean the real account password ships to every visitor.
 */
export async function signInAdmin(email, password) {
  const { auth } = await loadFirebase();
  const { signInWithEmailAndPassword } = await import("firebase/auth");

  // Session persistence keeps the admin signed in across a page reload without
  // leaving a long-lived credential on the device.
  const { setPersistence, browserSessionPersistence } = await import(
    "firebase/auth"
  );
  await setPersistence(auth, browserSessionPersistence);

  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

/** Sign the current admin out. Safe to call when nobody is signed in. */
export async function signOutAdmin() {
  const { auth } = await loadFirebase();
  const { signOut } = await import("firebase/auth");
  await signOut(auth);
}

/**
 * Subscribe to auth state. Returns an unsubscribe function.
 * Calls back with the user object, or null when signed out.
 */
export function watchAdminAuth(onChange) {
  let unsubscribe = null;
  let cancelled = false;

  loadFirebase()
    .then(({ auth }) =>
      import("firebase/auth").then(({ onAuthStateChanged }) => {
        const stop = onAuthStateChanged(auth, (user) => {
          if (!cancelled) onChange(user);
        });
        if (cancelled) stop(); // unmounted before auth finished loading
        else unsubscribe = stop;
      })
    )
    .catch((error) => {
      console.error("Error watching auth state:", error);
      if (!cancelled) onChange(null);
    });

  return () => {
    cancelled = true;
    if (unsubscribe) unsubscribe();
  };
}