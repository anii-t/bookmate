'use client';

import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import BookCard from '@/components/BookCard';
import { useBookStore } from '@/lib/store/bookStore';
import { ListType } from '@/lib/models/enums';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

function BookList({ books }: { books: ReturnType<typeof useBookStore.getState>['books'] }) {
  if (books.length === 0) {
    return <p className="p-6 text-center text-muted-foreground">No books yet.</p>;
  }
  return (
    <div className="flex flex-col gap-2 p-4">
      {books.map((book, i) => (
        <Link key={`${book.ISBN}-${book.title}-${i}`} href={`/books/${encodeURIComponent(book.title)}`}>
          <BookCard book={book} />
        </Link>
      ))}
    </div>
  );
}

export default function LibraryPage() {
  const books = useBookStore((s) => s.books);
  const loading = useBookStore((s) => s.loading);
  const library = books.filter((b) => b.listType === ListType.LIBRARY);
  const wishlist = books.filter((b) => b.listType === ListType.WISHLIST);

  return (
    <AuthGuard>
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-brand">BookMate</h1>
          <Link href="/add">
            <Button className="bg-brand hover:bg-brand/90">+ Add book</Button>
          </Link>
        </header>
        {loading && <p className="px-4 text-sm text-muted-foreground">Loading books…</p>}
        <Tabs defaultValue="library">
          <TabsList className="mx-4">
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="library">
            <BookList books={library} />
          </TabsContent>
          <TabsContent value="wishlist">
            <BookList books={wishlist} />
          </TabsContent>
          <TabsContent value="recommendations">
            <p className="p-6 text-center text-muted-foreground">Coming in a later task.</p>
          </TabsContent>
          <TabsContent value="analytics">
            <p className="p-6 text-center text-muted-foreground">Coming in a later task.</p>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  );
}
