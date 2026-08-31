'use client';

import { useBookStore } from '@/lib/store/bookStore';
import { ListType } from '@/lib/models/enums';
import StatBarList from '@/components/StatBarList';
import { aggregateGenres, aggregateReadingStatus, aggregateAuthors } from '@/lib/utils/libraryAnalytics';

export default function AnalyticsPage() {
  const books = useBookStore((s) => s.books);
  const library = books.filter((b) => b.listType === ListType.LIBRARY);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Insights from your library</p>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <StatBarList title="Reading status" entries={aggregateReadingStatus(library)} />
        <StatBarList title="Top genres" entries={aggregateGenres(library)} />
        <StatBarList title="Top authors" entries={aggregateAuthors(library)} />
      </div>
    </div>
  );
}
