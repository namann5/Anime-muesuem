// Admin access configuration.
//
// SECURITY: this value is injected at BUILD time via Vite, so it is embedded in
// the JS bundle and readable by anyone who loads the site. It therefore gates
// UI only -- it is NOT access control. Real protection must come from Firebase
// Security Rules + Firebase Auth (see firestore.rules / storage.rules).
//
// There is deliberately no default value. If the variable is unset, admin
// access stays disabled instead of shipping a well-known password.
const configured = import.meta.env.VITE_ADMIN_PASSWORD;

export const ADMIN_PASSWORD = configured || "";

// True only when a password was actually supplied at build time.
export const ADMIN_ACCESS_CONFIGURED = Boolean(configured);