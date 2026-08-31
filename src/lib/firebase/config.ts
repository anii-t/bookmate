import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBX2DTV39DKkA6C_tmGvQGVCTQjFBNzBHI',
  authDomain: 'capstone-da06d.firebaseapp.com',
  projectId: 'capstone-da06d',
  storageBucket: 'capstone-da06d.firebasestorage.app',
  messagingSenderId: '710203419649',
  appId: '1:710203419649:web:3d27c656b0de4dcc1ca400',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
