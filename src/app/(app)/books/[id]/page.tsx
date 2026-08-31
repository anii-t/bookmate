'use client';

import { useRouter, useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useBookStore } from '@/lib/store/bookStore';
import { updateBook, deleteBook } from '@/lib/firebase/firestore';
import { ALL_READING_STATUSES, ALL_BORROWING_STATUSES, BorrowingStatus, ReadingStatus } from '@/lib/models/enums';
import { Button } from '@/components/ui/button';
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
  const titleParam = decodeURIComponent(params.id);
  const books = useBookStore((s) => s.books);
  const updateBookLocal = useBookStore((s) => s.updateBookLocal);
  const removeBookLocal = useBookStore((s) => s.removeBookLocal);

  const book = useMemo(
    () => books.find((b) => b.title.toLowerCase() === titleParam.toLowerCase()),
    [books, titleParam]
  );
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
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <Button variant="ghost" className="w-fit" onClick={() => router.back()}>
        ← Back
      </Button>
      <div className="flex flex-col gap-8 sm:flex-row">
        <div className="h-64 w-44 shrink-0 overflow-hidden rounded bg-muted">
          {book.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold">{book.title}</h1>
            <p className="text-muted-foreground">{book.author}</p>
            <p className="text-xs text-muted-foreground">ISBN: {book.ISBN || '—'}</p>
          </div>

          <div>
            <Label>Reading status</Label>
            <Select value={book.readingStatus} onValueChange={(v) => save({ readingStatus: v as ReadingStatus })}>
              <SelectTrigger className="w-fit min-w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ALL_READING_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Ratings</Label>
            <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
              {RATING_LABELS.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <StarRating
                    value={book.rating[key]}
                    onChange={(value) => save({ rating: { ...book.rating, [key]: value } })}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Borrowing status</Label>
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
            {book.borrowing.borrowingStatus === BorrowingStatus.BORROWED && (
              <div className="mt-2 flex gap-2">
                <Input
                  placeholder="Borrower name"
                  defaultValue={book.borrowing.name}
                  onBlur={(e) => save({ borrowing: { ...book.borrowing, name: e.target.value } })}
                />
                <Input
                  type="date"
                  defaultValue={book.borrowing.date}
                  onBlur={(e) => save({ borrowing: { ...book.borrowing, date: e.target.value } })}
                />
              </div>
            )}
          </div>

          <div>
            <Button variant="destructive" onClick={handleDelete}>
              Delete book
            </Button>
            {saving && <p className="mt-2 text-xs text-muted-foreground">Saving…</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
