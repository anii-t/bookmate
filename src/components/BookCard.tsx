'use client';

import { BookModel } from '@/lib/models/BookModel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function BookCard({
  book,
  onClick,
  action,
}: {
  book: BookModel;
  onClick?: () => void;
  action?: React.ReactNode;
}) {
  return (
    <Card
      className="flex cursor-pointer flex-row gap-3 p-3 transition hover:shadow-md"
      onClick={onClick}
    >
      <div className="h-24 w-16 shrink-0 overflow-hidden rounded bg-muted">
        {book.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No cover
          </div>
        )}
      </div>
      <CardContent className="flex flex-1 flex-col justify-between p-0">
        <div>
          <p className="font-semibold leading-tight">{book.title || 'Untitled'}</p>
          <p className="text-sm text-muted-foreground">{book.author || 'Unknown author'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <Badge variant="secondary">{book.readingStatus}</Badge>
          {book.rating.overallRating > 0 && (
            <Badge className="bg-brand text-brand-foreground">
              {'★'.repeat(Math.round(book.rating.overallRating))}
            </Badge>
          )}
        </div>
      </CardContent>
      {action}
    </Card>
  );
}
