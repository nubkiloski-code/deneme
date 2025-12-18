
import * as firebase from 'firebase/app';
import * as auth from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit, Timestamp, Firestore } from 'firebase/firestore';
import { FirebaseConfig, ChatMessage } from '../types';

// Use namespaced types and variables for Firebase App and Auth to resolve export member errors.
let app: firebase.FirebaseApp | undefined;
let db: Firestore | undefined;

/**
 * Initialize Firebase using namespaced calls to bypass module resolution issues.
 */
export const initFirebase = (config: FirebaseConfig) => {
  if (!config.apiKey || !config.authDomain) {
    throw new Error("Missing Firebase Configuration");
  }
  
  if (!firebase.getApps().length) {
    app = firebase.initializeApp(config);
  } else {
    app = firebase.getApp();
  }
  
  db = getFirestore(app);
  return app;
};

export const getDb = () => {
    if (!db) throw new Error("Firebase not initialized");
    return db;
};

/**
 * Sign in with Google using auth namespace to resolve "no exported member" errors.
 */
export const signInWithGoogle = async (config: FirebaseConfig): Promise<auth.User> => {
  const firebaseApp = initFirebase(config);
  if (!firebaseApp) throw new Error("Firebase could not be initialized");
  
  const firebaseAuth = auth.getAuth(firebaseApp);
  const provider = new auth.GoogleAuthProvider();
  
  try {
    const result = await auth.signInWithPopup(firebaseAuth, provider);
    return result.user;
  } catch (error) {
    console.error("Firebase Auth Error:", error);
    throw error;
  }
};

export const saveMessageToFirestore = async (message: Omit<ChatMessage, 'id'>) => {
    if (!db) return;
    try {
        await addDoc(collection(db, 'messages'), {
            ...message,
            timestamp: Timestamp.now()
        });
    } catch (e) {
        console.error("Error saving message:", e);
    }
};

export const subscribeToMessages = (callback: (messages: ChatMessage[]) => void) => {
    if (!db) return () => {};
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    return onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                timestamp: data.timestamp?.toMillis() || Date.now()
            } as ChatMessage;
        });
        callback(msgs);
    });
};
