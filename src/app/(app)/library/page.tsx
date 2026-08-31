'use client';

import { useBookStore } from '@/lib/store/bookStore';
import { ListType } from '@/lib/models/enums';
import BookListView from '@/components/BookListView';

export default function LibraryPage() {
  const books = useBookStore((s) => s.books);
  const loading = useBookStore((s) => s.loading);
  const library = books.filter((b) => b.listType === ListType.LIBRARY);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Library</h1>
        <p className="text-sm text-muted-foreground">
          {library.length} book{library.length === 1 ? '' : 's'}
        </p>
      </div>
      {loading && <p className="mb-4 text-sm text-muted-foreground">Loading books…</p>}
      <BookListView
        books={library}
        emptyMessage="Your library is empty. Add your first book to get started."
      />
    </div>
  );
}
