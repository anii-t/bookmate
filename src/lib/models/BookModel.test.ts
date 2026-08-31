import { describe, it, expect } from 'vitest';
import { createDefaultBook, booksEqual } from './BookModel';
import { ListType, ReadingStatus } from './enums';

describe('createDefaultBook', () => {
  it('creates a book with library defaults and given ownerId', () => {
    const book = createDefaultBook('user-1');
    expect(book.ownerId).toBe('user-1');
    expect(book.listType).toBe(ListType.LIBRARY);
    expect(book.readingStatus).toBe(ReadingStatus.NOT_STARTED);
    expect(book.genres).toEqual([]);
  });
});

describe('booksEqual', () => {
  it('compares by case-insensitive title', () => {
    const a = { ...createDefaultBook(), title: 'Dune' };
    const b = { ...createDefaultBook(), title: 'dune' };
    expect(booksEqual(a, b)).toBe(true);
  });
});
