'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useUserStore } from '@/lib/store/userStore';
import { useBookStore } from '@/lib/store/bookStore';
import { signOut, deleteAccount } from '@/lib/firebase/auth';
import { deleteAllBooks, deleteUser as deleteUserDoc } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';

export default function SettingsPage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const clearUser = useUserStore((s) => s.clear);
  const clearBooks = useBookStore((s) => s.clear);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function handleSignOut() {
    try {
      await signOut();
      clearUser();
      clearBooks();
      router.replace('/login');
    } catch (e) {
      console.error('Failed to sign out', e);
      toast.add({
        title: 'Failed to sign out',
        description: 'Please try again.',
        type: 'error',
      });
    }
  }

  async function handleDeleteAccount() {
    if (!user) return;
    try {
      await deleteAllBooks(user.id);
      await deleteUserDoc(user);
      await deleteAccount();
      clearUser();
      clearBooks();
      router.replace('/login');
    } catch (e) {
      console.error('Failed to delete account', e);
      toast.add({
        title: 'Failed to delete account',
        description: 'You may need to sign out and sign back in, then try again.',
        type: 'error',
      });
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 p-4">
      <Button variant="ghost" className="w-fit" onClick={() => router.back()}>
        ← Back
      </Button>
      <h1 className="text-xl font-bold text-brand">Settings</h1>
      {user && (
        <div className="rounded border p-3 text-sm">
          <p className="font-medium">{user.name}</p>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      )}
      <Button variant="outline" onClick={handleSignOut}>
        Sign out
      </Button>
      {!confirmingDelete ? (
        <Button variant="destructive" onClick={() => setConfirmingDelete(true)}>
          Delete account
        </Button>
      ) : (
        <div className="flex flex-col gap-2 rounded border border-destructive p-3">
          <p className="text-sm">
            This permanently deletes your account and all books. This cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Yes, delete everything
            </Button>
            <Button variant="outline" onClick={() => setConfirmingDelete(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
