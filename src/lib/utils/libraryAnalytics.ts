import { BookModel } from '../models/BookModel';
import { ALL_READING_STATUSES, ReadingStatus } from '../models/enums';

export type CountEntry = {
  key: string;
  label: string;
  count: number;
};

function titleCase(s: string): string {
  return s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
}

export function aggregateGenres(books: BookModel[], limit = 14): CountEntry[] {
  const map = new Map<string, { label: string; count: number }>();
  for (const book of books) {
    for (const g of book.genres) {
      const raw = g.trim();
      if (!raw) continue;
      const key = raw.toLowerCase();
      const prev = map.get(key);
      if (prev) prev.count += 1;
      else map.set(key, { label: titleCase(raw), count: 1 });
    }
  }
  return Array.from(map.entries())
    .map(([key, v]) => ({ key, label: v.label, count: v.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function aggregateReadingStatus(books: BookModel[]): CountEntry[] {
  const map = new Map<ReadingStatus, number>();
  for (const s of ALL_READING_STATUSES) map.set(s, 0);
  for (const book of books) {
    const n = map.get(book.readingStatus) ?? 0;
    map.set(book.readingStatus, n + 1);
  }
  return ALL_READING_STATUSES.map((status) => ({
    key: status,
    label: status,
    count: map.get(status) ?? 0,
  }));
}

export function aggregateAuthors(books: BookModel[], limit = 12): CountEntry[] {
  const map = new Map<string, { label: string; count: number }>();
  for (const book of books) {
    const raw = book.author?.trim() ?? '';
    if (!raw) continue;
    const key = raw.toLowerCase();
    const prev = map.get(key);
    if (prev) prev.count += 1;
    else map.set(key, { label: raw, count: 1 });
  }
  return Array.from(map.entries())
    .map(([key, v]) => ({ key, label: v.label, count: v.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function maxCount(entries: CountEntry[]): number {
  return entries.reduce((m, e) => Math.max(m, e.count), 0);
}
