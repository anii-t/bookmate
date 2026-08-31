import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  deleteUser,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from './config';

const provider = new GoogleAuthProvider();
provider.addScope('profile');
provider.addScope('email');

export async function signInWithGoogle(): Promise<{
  uid: string;
  email: string | null;
  displayName: string | null;
}> {
  const result = await signInWithPopup(auth, provider);
  const { uid, email, displayName } = result.user;
  return { uid, email, displayName };
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function deleteAccount(): Promise<void> {
  const user = auth.currentUser;
  if (user) await deleteUser(user);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export function onAuthStateChanged(callback: (user: User | null) => void): () => void {
  return firebaseOnAuthStateChanged(auth, callback);
}
