// Firebase Configuration
// The SDK is loaded lazily via dynamic import: it is ~400 kB minified and is
// only needed for admin character uploads plus the optional Firestore read.
// Importing it eagerly forced every 3D route to pay for it on first paint.

const firebaseConfig = {
  apiKey: "AIzaSyB86pO_hyS4ug4X6PrWsSqHkdLtiroAp18",
  authDomain: "anime-museum.firebaseapp.com",
  projectId: "anime-museum",
  storageBucket: "anime-museum.firebasestorage.app",
  messagingSenderId: "739494400540",
  appId: "1:739494400540:web:e2b67f16e28a7734a485d9",
  measurementId: "G-0D6BQ20C3B",
};

// Resolves to { app, auth, storage, db, analytics }. Cached after the first call so
// repeat callers share one initialization. `analytics` is null unless the
// environment supports it.
let pending = null;

export function loadFirebase() {
  if (pending) return pending;

  pending = (async () => {
    const [{ initializeApp }, { getStorage }, { getFirestore }, { getAuth }] =
      await Promise.all([
        import("firebase/app"),
        import("firebase/storage"),
        import("firebase/firestore"),
        import("firebase/auth"),
      ]);

    const app = initializeApp(firebaseConfig);

    // getAnalytics throws in non-browser contexts (SSR, some test runners)
    // and when a user has blocked it, so treat it as strictly optional.
    let analytics = null;
    try {
      if (typeof window !== "undefined" && window.document) {
        const { getAnalytics } = await import("firebase/analytics");
        analytics = getAnalytics(app);
      }
    } catch {
      analytics = null;
    }

    return {
      app,
      auth: getAuth(app),
      storage: getStorage(app),
      db: getFirestore(app),
      analytics,
    };
  })();

  return pending;
}

export default loadFirebase;