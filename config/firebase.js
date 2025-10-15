// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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

// Initialize Firebase services with proper persistence
const analytics = Platform.OS === 'web' ? getAnalytics(app) : undefined;
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const db = getFirestore(app);
const storage = getStorage(app);

// Enable offline persistence (web only)
if (Platform.OS === 'web') {
  enableIndexedDbPersistence(db)
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Firebase persistence failed: Multiple tabs open');
      } else if (err.code === 'unimplemented') {
        console.warn('Firebase persistence not supported in this environment');
      }
    });
}

export { app, analytics, auth, db, storage };
