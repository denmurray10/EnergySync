// src/lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFunctions, Functions } from "firebase/functions";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// This check provides a clear error message if the environment variables are missing.
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error(
        '🔴 Firebase API Key or Project ID is missing from your environment variables. The application will not connect to Firebase. Please ensure your .env file is configured correctly.'
    );
} else {
    // Log the project ID to help with debugging.
    console.log(`⚪️ Connecting to Firebase project: ${firebaseConfig.projectId}`);
}

// Initialize Firebase
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = getAuth(app);
const functions: Functions = getFunctions(app);
const firestore: Firestore = getFirestore(app);


export { app, auth, functions, firestore };
