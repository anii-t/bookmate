'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { searchByISBN, searchByTitle } from '@/lib/network/bookService';
import { convertToBook } from '@/lib/network/bookModelCreator';
import { normalizeIsbnInput } from '@/lib/utils/isbn';
import { useUserStore } from '@/lib/store/userStore';
import { useBookStore } from '@/lib/store/bookStore';
import { addBook } from '@/lib/firebase/firestore';
import BookCard from '@/components/BookCard';
import BarcodeScanner from '@/components/BarcodeScanner';
import { BookModel } from '@/lib/models/BookModel';
import { toast } from '@/components/ui/toast';

export default function AddBookPage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const addBookLocal = useBookStore((s) => s.addBookLocal);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<BookModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [scanning, setScanning] = useState(false);

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

  async function handleScanned(isbn: string) {
    setScanning(false);
    setQuery(isbn);
    if (!user) return;
    setError(null);
    setResult(null);
    setSearching(true);
    try {
      const response = await searchByISBN(isbn);
      const book = convertToBook(response, user);
      if (!book) {
        setError('No results found for the scanned barcode. Try manual search.');
      } else {
        setResult(book);
      }
    } catch {
      setError('Search failed. Please check your connection and try again.');
    } finally {
      setSearching(false);
    }
  }

  async function handleAdd() {
    if (!result) return;
    try {
      const id = await addBook(result);
      addBookLocal({ ...result, id });
      router.replace('/library');
    } catch (e) {
      console.error('Failed to add book', e);
      toast.add({
        title: 'Failed to add book',
        description: 'Please check your connection and try again.',
        type: 'error',
      });
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-bold">Add a book</h1>
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
      <Button variant="outline" onClick={() => setScanning((s) => !s)}>
        {scanning ? 'Cancel scan' : 'Scan barcode'}
      </Button>
      {scanning && (
        <BarcodeScanner
          onDetected={handleScanned}
          onError={(msg) => {
            setScanning(false);
            setError(msg);
          }}
        />
      )}
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
  );
}
