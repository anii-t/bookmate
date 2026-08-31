'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { searchByISBN, searchByTitle } from '@/lib/network/bookService';
import { convertToBook } from '@/lib/network/bookModelCreator';
import { normalizeIsbnInput } from '@/lib/utils/isbn';
import { useUserStore } from '@/lib/store/userStore';
import { useBookStore } from '@/lib/store/bookStore';
import { addBook } from '@/lib/firebase/firestore';
import BookCard from '@/components/BookCard';
import { BookModel } from '@/lib/models/BookModel';

export default function AddBookPage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const addBookLocal = useBookStore((s) => s.addBookLocal);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<BookModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  async function handleSearch() {
    if (!user) return;
    setError(null);
    setResult(null);
    setSearching(true);
    try {
      const trimmed = query.trim();
      const isbnLike = /^[0-9X-]{6,}$/i.test(trimmed);
      const response = isbnLike
        ? await searchByISBN(normalizeIsbnInput(trimmed))
        : await searchByTitle(trimmed);
      const book = convertToBook(response, user);
      if (!book) {
        setError('No results found. Try a different search.');
      } else {
        setResult(book);
      }
    } catch (e) {
      console.error('Search failed', e);
      setError('Search failed. Please check your connection and try again.');
    } finally {
      setSearching(false);
    }
  }

  async function handleAdd() {
    if (!result) return;
    await addBook(result);
    addBookLocal(result);
    router.replace('/library');
  }

  return (
    <AuthGuard>
      <div className="mx-auto flex max-w-lg flex-col gap-4 p-4">
        <Button variant="ghost" className="w-fit" onClick={() => router.back()}>
          ← Back
        </Button>
        <h1 className="text-xl font-bold text-brand">Add a book</h1>
        <div className="flex gap-2">
          <Input
            placeholder="ISBN or title"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={searching || !query.trim()}>
            {searching ? 'Searching…' : 'Search'}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {result && (
          <div className="flex flex-col gap-2">
            <BookCard book={result} />
            <Button className="bg-brand hover:bg-brand/90" onClick={handleAdd}>
              Add to library
            </Button>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
