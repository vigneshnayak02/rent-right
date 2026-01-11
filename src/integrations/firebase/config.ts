// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIzNV7UYOV5Rsc4WkOvdz_xhJfY0IwNAc",
  authDomain: "ps-rentals.firebaseapp.com",
  databaseURL: "https://ps-rentals-default-rtdb.firebaseio.com",
  projectId: "ps-rentals",
  storageBucket: "ps-rentals.firebasestorage.app",
  messagingSenderId: "963209301864",
  appId: "1:963209301864:web:05c44bbd616b672c4450dd",
  measurementId: "G-YW7PWKKCQE"
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
