'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from '@/lib/firebase/auth';
import { addUser } from '@/lib/firebase/firestore';
import { useUserStore } from '@/lib/store/userStore';
import { useBookStore } from '@/lib/store/bookStore';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, authChecked, setUser, setAuthChecked } = useUserStore();
  const loadBooks = useBookStore((s) => s.loadBooks);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const model = {
          id: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          name: firebaseUser.displayName ?? '',
        };
        setUser(model);
        await addUser(model);
        await loadBooks(model.id);
      } else {
        setUser(null);
        router.replace('/login');
      }
      setAuthChecked(true);
    });
    return unsubscribe;
  }, [router, setUser, setAuthChecked, loadBooks]);

  if (!authChecked) {
    return <div className="flex h-screen items-center justify-center">Loading…</div>;
  }
  if (!user) {
    return null;
  }
  return <>{children}</>;
}
