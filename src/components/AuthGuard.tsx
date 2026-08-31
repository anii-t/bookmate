'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from '@/lib/firebase/auth';
import { addUser } from '@/lib/firebase/firestore';
import { useUserStore } from '@/lib/store/userStore';
import { useBookStore } from '@/lib/store/bookStore';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, authChecked, setUser, setAuthChecked } = useUserStore();
  const loadBooks = useBookStore((s) => s.loadBooks);
  const isLoginRoute = pathname === '/login';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const model = {
            id: firebaseUser.uid,
            email: firebaseUser.email ?? '',
            name: firebaseUser.displayName ?? '',
          };
          setUser(model);
          try {
            await addUser(model);
          } catch (e) {
            // Non-fatal: don't block the UI on a transient Firestore write failure.
            console.error('Failed to persist user record', e);
          }
          await loadBooks(model.id);
        } else {
          setUser(null);
          if (!isLoginRoute) {
            router.replace('/login');
          }
        }
      } catch (e) {
        console.error('Auth state handling failed', e);
      } finally {
        // Always unblock the UI, even if the write/fetch above failed.
        setAuthChecked(true);
      }
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, setUser, setAuthChecked, loadBooks, isLoginRoute]);

  if (!authChecked) {
    return <div className="flex h-screen items-center justify-center">Loading…</div>;
  }
  // The /login page renders its own content regardless of auth state so it
  // never gets stuck behind the "no user -> render null" branch below (which
  // would otherwise create a redirect loop / blank screen when AuthGuard is
  // mounted globally in the root layout).
  if (isLoginRoute) {
    return <>{children}</>;
  }
  if (!user) {
    return null;
  }
  return <>{children}</>;
}
