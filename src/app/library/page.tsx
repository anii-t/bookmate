'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BookCard from '@/components/BookCard';
import { useBookStore } from '@/lib/store/bookStore';
import { ListType } from '@/lib/models/enums';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { fetchRankedRecommendations } from '@/lib/utils/recommendationEngine';
import { BookModel } from '@/lib/models/BookModel';
import StatBarList from '@/components/StatBarList';
import { aggregateGenres, aggregateReadingStatus, aggregateAuthors } from '@/lib/utils/libraryAnalytics';
import { addBook } from '@/lib/firebase/firestore';
import { useUserStore } from '@/lib/store/userStore';
import { toast } from '@/components/ui/toast';

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
  const addBookLocal = useBookStore((s) => s.addBookLocal);
  const user = useUserStore((s) => s.user);
  const library = books.filter((b) => b.listType === ListType.LIBRARY);
  const wishlist = books.filter((b) => b.listType === ListType.WISHLIST);

  const [recommendations, setRecommendations] = useState<BookModel[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    let ignore = false;
    if (library.length === 0) return;
    setLoadingRecs(true);
    fetchRankedRecommendations(library)
      .then((recs) => {
        if (!ignore) setRecommendations(recs);
      })
      .finally(() => {
        if (!ignore) setLoadingRecs(false);
      });
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [library.length]);

  async function handleAddRecommendation(book: BookModel) {
    if (!user) return;
    const toAdd = { ...book, ownerId: user.id };
    try {
      await addBook(toAdd);
      addBookLocal(toAdd);
      setRecommendations((prev) => prev.filter((b) => b !== book));
    } catch (e) {
      console.error('Failed to add recommended book', e);
      toast.add({
        title: 'Could not add book',
        description: 'Please try again.',
        type: 'error',
      });
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header className="flex items-center justify-between p-4">
        <h1 className="text-xl font-bold text-brand">BookMate</h1>
        <div className="flex gap-2">
          <Link href="/add">
            <Button className="bg-brand hover:bg-brand/90">+ Add book</Button>
          </Link>
          <Link href="/settings">
            <Button variant="ghost">Settings</Button>
          </Link>
        </div>
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
          {loadingRecs && <p className="p-4 text-sm text-muted-foreground">Finding recommendations…</p>}
          {!loadingRecs && recommendations.length === 0 && (
            <p className="p-6 text-center text-muted-foreground">
              Add a few books to your library to get recommendations.
            </p>
          )}
          <div className="flex flex-col gap-2 p-4">
            {recommendations.map((book, i) => (
              <BookCard
                key={`${book.title}-${i}`}
                book={book}
                action={
                  <Button
                    size="sm"
                    className="shrink-0 bg-brand hover:bg-brand/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddRecommendation(book);
                    }}
                  >
                    + Add
                  </Button>
                }
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="analytics">
          <div className="flex flex-col gap-6 p-4">
            <StatBarList title="Reading status" entries={aggregateReadingStatus(library)} />
            <StatBarList title="Top genres" entries={aggregateGenres(library)} />
            <StatBarList title="Top authors" entries={aggregateAuthors(library)} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
