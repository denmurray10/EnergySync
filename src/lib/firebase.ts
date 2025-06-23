// src/lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

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

// This safeguard prevents the app from crashing if Firebase credentials are not set.
// It will log a clear error to the console and disable Firebase features.
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } catch (e: any) {
    console.error("Failed to initialize Firebase. Please check your credentials in the .env file.", e);
    // Create a mock auth object if initialization fails
    auth = {
      onAuthStateChanged: (callback) => {
        // Immediately invoke with null to indicate no user is logged in and loading is complete.
        setTimeout(() => callback(null), 0);
        return () => {}; // Return an empty unsubscribe function
      }
    } as any; // Using 'as any' to mock the Auth interface for crash prevention.
    app = {} as FirebaseApp;
  }
} else {
  console.error(
    '🔴 Firebase API Key or Project ID is missing. Please add them to your .env file.\n' +
    'Example .env file:\n' +
    'NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"\n' +
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"\n' +
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"\n' +
    '...'
  );
  // Create a mock auth object to prevent the app from crashing.
  auth = {
    onAuthStateChanged: (callback) => {
      setTimeout(() => callback(null), 0);
      return () => {};
    }
  } as any;
  app = {} as FirebaseApp;
}

export { app, auth };
