// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration (use Vite env vars when available)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBIzNV7UYOV5Rsc4WkOvdz_xhJfY0IwNAc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ps-rentals.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://ps-rentals-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ps-rentals",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ps-rentals.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "963209301864",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:963209301864:web:05c44bbd616b672c4450dd",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-YW7PWKKCQE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;
