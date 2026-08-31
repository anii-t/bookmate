'use client';

import { useEffect, useRef, useState } from 'react';
import { useBookStore } from '@/lib/store/bookStore';
import { useUserStore } from '@/lib/store/userStore';
import { ListType } from '@/lib/models/enums';
import { BookModel } from '@/lib/models/BookModel';
import { fetchRankedRecommendations } from '@/lib/utils/recommendationEngine';
import { addBook } from '@/lib/firebase/firestore';
import { toast } from '@/components/ui/toast';
import BookCard from '@/components/BookCard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function RecommendationsPage() {
  const books = useBookStore((s) => s.books);
  const addBookLocal = useBookStore((s) => s.addBookLocal);
  const user = useUserStore((s) => s.user);
  const library = books.filter((b) => b.listType === ListType.LIBRARY);

  const [recommendations, setRecommendations] = useState<BookModel[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  // Guards against re-fetching (and wiping the list) every time library.length
  // changes because the user added/removed a book from this very page — we
  // only want the automatic fetch to run once per visit, when the library
  // first has books to build a taste profile from.
  const hasFetchedRef = useRef(false);

  function loadRecommendations() {
    let ignore = false;
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
  }

  useEffect(() => {
    if (hasFetchedRef.current || library.length === 0) return;
    hasFetchedRef.current = true;
    return loadRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [library.length]);

  async function handleAddRecommendation(book: BookModel, listType: ListType) {
    if (!user) return;
    const toAdd = { ...book, ownerId: user.id, listType };
    try {
      const id = await addBook(toAdd);
      addBookLocal({ ...toAdd, id });
      setRecommendations((prev) => prev.filter((b) => b !== book));
      toast.add({
        title: listType === ListType.WISHLIST ? 'Added to wishlist' : 'Added to library',
        type: 'success',
      });
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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Recommendations</h1>
        <p className="text-sm text-muted-foreground">Based on your library</p>
      </div>
      {loadingRecs && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      {!loadingRecs && recommendations.length === 0 && (
        <p className="py-16 text-center text-muted-foreground">
          Add a few books to your library to get recommendations.
        </p>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {recommendations.map((book, i) => (
          <BookCard
            key={`${book.title}-${i}`}
            book={book}
            layout="grid"
            action={
              <div className="flex gap-1">
                <Button
                  size="sm"
                  className="flex-1 bg-brand hover:bg-brand/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddRecommendation(book, ListType.LIBRARY);
                  }}
                >
                  + Library
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddRecommendation(book, ListType.WISHLIST);
                  }}
                >
                  + Wishlist
                </Button>
              </div>
            }
          />
        ))}
      </div>
    </div>
  );
}
