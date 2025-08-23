
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Use environment variables if available, otherwise use demo project for development
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cosmivity.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cosmivity",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cosmivity.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id",
};

// Lazy initialize Firebase only when needed
let firebaseApp: any = null;
let firebaseAuth: any = null;
let firebaseDb: any = null;
let firebaseStorage: any = null;
let firebaseFunctions: any = null;

function initializeFirebase() {
  if (!firebaseApp) {
    console.log('🔥 Initializing Firebase...');
    firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    firebaseAuth = getAuth(firebaseApp);
    firebaseDb = getFirestore(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);
    firebaseFunctions = getFunctions(firebaseApp);
    
    console.log('✅ Firebase initialized successfully');
  }
  return { 
    app: firebaseApp, 
    auth: firebaseAuth, 
    db: firebaseDb, 
    storage: firebaseStorage, 
    functions: firebaseFunctions 
  };
}

// Export getters that initialize Firebase on first access
export const getFirebaseAuth = () => {
  const firebase = initializeFirebase();
  return firebase.auth;
};

export const getFirebaseDb = () => {
  const firebase = initializeFirebase();
  return firebase.db;
};

export const getFirebaseStorage = () => {
  const firebase = initializeFirebase();
  return firebase.storage;
};

export const getFirebaseFunctions = () => {
  const firebase = initializeFirebase();
  return firebase.functions;
};

export const getFirebaseApp = () => {
  const firebase = initializeFirebase();
  return firebase.app;
};

// Legacy exports for backward compatibility - lazy loaded
export const auth = getFirebaseAuth();
export const db = getFirebaseDb();
export const storage = getFirebaseStorage();
export const functions = getFirebaseFunctions();
export const app = getFirebaseApp();
