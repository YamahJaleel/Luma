// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBia0bNGRYckkFKcH0ZbHCYDLsBy1LqJ6Q",
  authDomain: "luma-app-c2412.firebaseapp.com",
  projectId: "luma-app-c2412",
  storageBucket: "luma-app-c2412.firebasestorage.app",
  messagingSenderId: "24101277929",
  appId: "1:24101277929:web:2084137c701a243573e078",
  measurementId: "G-YF2PEQ5RJG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };
