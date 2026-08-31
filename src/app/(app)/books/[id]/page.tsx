'use client';

import { useRouter, useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useBookStore } from '@/lib/store/bookStore';
import { updateBook, deleteBook } from '@/lib/firebase/firestore';
import { ALL_READING_STATUSES, ALL_BORROWING_STATUSES, BorrowingStatus, ReadingStatus } from '@/lib/models/enums';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookModel } from '@/lib/models/BookModel';
import { RatingModel } from '@/lib/models/RatingModel';
import { toast } from '@/components/ui/toast';
import StarRating from '@/components/StarRating';

const RATING_LABELS: { key: keyof RatingModel; label: string }[] = [
  { key: 'emotionalImpact', label: 'Emotional impact' },
  { key: 'character', label: 'Characters' },
  { key: 'pacing', label: 'Pacing' },
  { key: 'storyline', label: 'Storyline' },
  { key: 'writingStyle', label: 'Writing style' },
  { key: 'overallRating', label: 'Overall rating' },
];

export default function BookDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const books = useBookStore((s) => s.books);
  const updateBookLocal = useBookStore((s) => s.updateBookLocal);
  const removeBookLocal = useBookStore((s) => s.removeBookLocal);

  const book = useMemo(() => books.find((b) => b.id === params.id), [books, params.id]);
  const [saving, setSaving] = useState(false);

  if (!book) {
    return <p className="p-6 text-center text-muted-foreground">Book not found.</p>;
  }

  async function save(patch: Partial<BookModel>) {
    const updated = { ...book, ...patch } as BookModel;
    setSaving(true);
    updateBookLocal(updated);
    try {
      await updateBook(updated);
    } catch (e) {
      console.error('Failed to save book', e);
      toast.add({
        title: 'Failed to save changes',
        description: 'Please check your connection and try again.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteBook(book!);
      removeBookLocal(book!);
      router.replace('/library');
    } catch (e) {
      console.error('Failed to delete book', e);
      toast.add({
        title: 'Failed to delete book',
        description: 'Please try again.',
        type: 'error',
      });
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Button variant="ghost" className="w-fit" onClick={() => router.back()}>
        ← Back
      </Button>

      <div className="mt-6 flex flex-col gap-10 lg:flex-row">
        <div className="h-96 w-64 shrink-0 overflow-hidden rounded-xl bg-muted shadow-sm">
          {book.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              No cover
            </div>
          )}
        </div>

        <div className="flex max-w-xl flex-1 flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold">{book.title}</h1>
            <p className="mt-1 text-lg text-muted-foreground">{book.author}</p>
            <p className="mt-1 text-xs text-muted-foreground">ISBN: {book.ISBN || '—'}</p>
            {book.genres.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {book.genres.map((genre) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <section className="rounded-xl border border-border p-5">
            <h2 className="mb-4 text-sm font-medium text-muted-foreground">Status</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="mb-1.5 block text-xs">Reading status</Label>
                <Select value={book.readingStatus} onValueChange={(v) => save({ readingStatus: v as ReadingStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ALL_READING_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">Borrowing status</Label>
                <Select
                  value={book.borrowing.borrowingStatus}
                  onValueChange={(v) => save({ borrowing: { ...book.borrowing, borrowingStatus: v as BorrowingStatus } })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ALL_BORROWING_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {book.borrowing.borrowingStatus === BorrowingStatus.BORROWED && (
              <div className="mt-4 grid grid-cols-2 gap-6 border-t border-border pt-4">
                <div>
                  <Label className="mb-1.5 block text-xs">Borrower name</Label>
                  <Input
                    placeholder="Borrower name"
                    defaultValue={book.borrowing.name}
                    onBlur={(e) => save({ borrowing: { ...book.borrowing, name: e.target.value } })}
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Borrowed on</Label>
                  <Input
                    type="date"
                    defaultValue={book.borrowing.date}
                    onBlur={(e) => save({ borrowing: { ...book.borrowing, date: e.target.value } })}
                  />
                </div>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-border p-5">
            <h2 className="mb-4 text-sm font-medium text-muted-foreground">Ratings</h2>
            <div className="flex flex-col gap-3">
              {RATING_LABELS.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <span className="text-sm">{label}</span>
                  <StarRating
                    value={book.rating[key]}
                    onChange={(value) => save({ rating: { ...book.rating, [key]: value } })}
                  />
                </div>
              ))}
            </div>
          </section>

          <div className="flex items-center gap-3 border-t border-border pt-6">
            <Button variant="destructive" onClick={handleDelete}>
              Delete book
            </Button>
            {saving && <p className="text-xs text-muted-foreground">Saving…</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
