import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { FirebaseConfig } from '../types';

let app: FirebaseApp | undefined;

export const initFirebase = (config: FirebaseConfig) => {
  if (!config.apiKey || !config.authDomain) {
    throw new Error("Missing Firebase Configuration");
  }
  
  if (!getApps().length) {
    app = initializeApp(config);
  } else {
    app = getApp();
  }
  
  return app;
};

export const signInWithGoogle = async (config: FirebaseConfig): Promise<User> => {
  const firebaseApp = initFirebase(config);
  const auth = getAuth(firebaseApp);
  const provider = new GoogleAuthProvider();
  
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Firebase Auth Error:", error);
    throw error;
  }
};