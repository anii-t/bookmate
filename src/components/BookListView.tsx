'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutGrid, List, ArrowUpAZ, ArrowDownAZ, ArrowUpDown } from 'lucide-react';
import { BookModel } from '@/lib/models/BookModel';
import BookCard from '@/components/BookCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TitleSort = 'none' | 'asc' | 'desc';

function nextTitleSort(current: TitleSort): TitleSort {
  if (current === 'none') return 'asc';
  if (current === 'asc') return 'desc';
  return 'none';
}

export default function BookListView({
  books,
  emptyMessage = 'No books yet.',
}: {
  books: BookModel[];
  emptyMessage?: string;
}) {
  const router = useRouter();
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [titleSort, setTitleSort] = useState<TitleSort>('none');

  const sortedBooks = useMemo(() => {
    if (titleSort === 'none') return books;
    const sorted = [...books].sort((a, b) => a.title.localeCompare(b.title));
    return titleSort === 'desc' ? sorted.reverse() : sorted;
  }, [books, titleSort]);

  if (books.length === 0) {
    return <p className="py-16 text-center text-muted-foreground">{emptyMessage}</p>;
  }

  const TitleSortIcon = titleSort === 'asc' ? ArrowUpAZ : titleSort === 'desc' ? ArrowDownAZ : ArrowUpDown;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTitleSort((s) => nextTitleSort(s))}
        >
          <TitleSortIcon className="mr-1.5 h-4 w-4" />
          Title
        </Button>
        <div className="flex items-center gap-1">
          <Button
            variant={view === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            aria-label="Grid view"
            onClick={() => setView('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'table' ? 'secondary' : 'ghost'}
            size="sm"
            aria-label="Table view"
            onClick={() => setView('table')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {sortedBooks.map((book, i) => (
            <Link key={book.id ?? `${book.ISBN}-${book.title}-${i}`} href={`/books/${book.id}`}>
              <BookCard book={book} layout="grid" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2">
                  <button
                    type="button"
                    className="flex items-center gap-1 hover:text-foreground"
                    onClick={() => setTitleSort((s) => nextTitleSort(s))}
                  >
                    Title
                    <TitleSortIcon className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="px-4 py-2">Author</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Rating</th>
              </tr>
            </thead>
            <tbody>
              {sortedBooks.map((book, i) => (
                <tr
                  key={book.id ?? `${book.ISBN}-${book.title}-${i}`}
                  className={cn(
                    'cursor-pointer border-t border-border transition-colors hover:bg-muted/40',
                    i % 2 === 1 && 'bg-muted/10'
                  )}
                  onClick={() => router.push(`/books/${book.id}`)}
                >
                  <td className="px-4 py-2.5 font-medium">{book.title || 'Untitled'}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{book.author || 'Unknown author'}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant="secondary">{book.readingStatus}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {book.rating.overallRating > 0 ? '★'.repeat(Math.round(book.rating.overallRating)) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
