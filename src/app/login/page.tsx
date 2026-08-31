'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle } from '@/lib/firebase/auth';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    setError(null);
    try {
      await signInWithGoogle();
      router.replace('/library');
    } catch {
      setError('Sign-in was cancelled or failed. Please try again.');
    }
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-brand/10">
      <h1 className="text-3xl font-bold text-brand">BookMate</h1>
      <p className="text-sm text-muted-foreground">Sign in to manage your library</p>
      <Button className="bg-brand hover:bg-brand/90" onClick={handleSignIn}>
        Sign in with Google
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
