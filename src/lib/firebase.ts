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

let app: FirebaseApp;
let auth: Auth;
let functions: Functions;
let firestore: Firestore;

// This safeguard prevents the app from crashing if Firebase credentials are not set or are invalid.
// It will log a clear error to the console and allow the app to run in a disconnected state.
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error(
        '🔴 Firebase API Key or Project ID is missing. The application will not connect to Firebase. Please ensure your .env.local file is configured correctly.'
    );
    // Create mock objects to prevent the app from crashing.
    app = {} as FirebaseApp;
    auth = {
        onAuthStateChanged: (callback) => {
            setTimeout(() => callback(null), 0); // Ensures AuthProvider doesn't hang in loading state
            return () => {}; // Return an empty unsubscribe function
        }
    } as any;
    functions = {} as any;
    firestore = {} as any;
} else {
    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        functions = getFunctions(app);
        firestore = getFirestore(app);
        console.log(`⚪️ Connected to Firebase project: ${firebaseConfig.projectId}`);
    } catch (error) {
        console.error("Failed to initialize Firebase, please check your credentials:", error);
        // Create mock objects to prevent the app from crashing.
        app = {} as FirebaseApp;
        auth = {
            onAuthStateChanged: (callback) => {
                setTimeout(() => callback(null), 0);
                return () => {};
            }
        } as any;
        functions = {} as any;
        firestore = {} as any;
    }
}

export { app, auth, functions, firestore };