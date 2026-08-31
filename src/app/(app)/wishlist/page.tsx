'use client';

import { useBookStore } from '@/lib/store/bookStore';
import { ListType } from '@/lib/models/enums';
import BookListView from '@/components/BookListView';

export default function WishlistPage() {
  const books = useBookStore((s) => s.books);
  const loading = useBookStore((s) => s.loading);
  const wishlist = books.filter((b) => b.listType === ListType.WISHLIST);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Wishlist</h1>
        <p className="text-sm text-muted-foreground">
          {wishlist.length} book{wishlist.length === 1 ? '' : 's'}
        </p>
      </div>
      {loading && <p className="mb-4 text-sm text-muted-foreground">Loading books…</p>}
      <BookListView
        books={wishlist}
        emptyMessage="Your wishlist is empty. Add books you want to read next."
      />
    </div>
  );
}
