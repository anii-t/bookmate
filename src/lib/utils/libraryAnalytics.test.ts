import { describe, it, expect } from 'vitest';
import { aggregateReadingStatus } from './libraryAnalytics';
import { createDefaultBook } from '../models/BookModel';
import { ReadingStatus } from '../models/enums';

describe('aggregateReadingStatus', () => {
  it('includes zero-count statuses and counts correctly', () => {
    const books = [
      { ...createDefaultBook(), readingStatus: ReadingStatus.FINISHED },
      { ...createDefaultBook(), readingStatus: ReadingStatus.FINISHED },
    ];
    const result = aggregateReadingStatus(books);
    const finished = result.find((r) => r.key === ReadingStatus.FINISHED);
    const notStarted = result.find((r) => r.key === ReadingStatus.NOT_STARTED);
    expect(finished?.count).toBe(2);
    expect(notStarted?.count).toBe(0);
  });
});
