// Firebase Configuration
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB86pO_hyS4ug4X6PrWsSqHkdLtiroAp18",
  authDomain: "anime-museum.firebaseapp.com",
  projectId: "anime-museum",
  storageBucket: "anime-museum.firebasestorage.app",
  messagingSenderId: "739494400540",
  appId: "1:739494400540:web:e2b67f16e28a7734a485d9",
  measurementId: "G-0D6BQ20C3B",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);
const db = getFirestore(app);

console.log("Firebase initialized successfully");

export { storage, db, analytics };
export default app;
