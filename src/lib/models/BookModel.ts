import { ListType, ReadingStatus } from './enums';
import { BorrowingModel, createDefaultBorrowing } from './BorrowingModel';
import { RatingModel, createDefaultRating } from './RatingModel';

export interface BookModel {
  /** Firestore document ID. Absent only for ephemeral, not-yet-persisted
   * books (e.g. a search result or recommendation before it's been added). */
  id?: string;
  ISBN: string;
  coverUrl: string;
  author: string;
  title: string;
  genres: string[];
  readingStatus: ReadingStatus;
  borrowing: BorrowingModel;
  rating: RatingModel;
  listType: ListType;
  ownerId: string;
}

export function createDefaultBook(ownerId: string = ''): BookModel {
  return {
    ISBN: '',
    coverUrl: '',
    author: '',
    title: '',
    genres: [],
    readingStatus: ReadingStatus.NOT_STARTED,
    borrowing: createDefaultBorrowing(),
    rating: createDefaultRating(),
    listType: ListType.LIBRARY,
    ownerId,
  };
}

// Title-based comparison, used only for de-duplicating ephemeral,
// not-yet-persisted books (e.g. recommendations) against the current
// library — those don't have a Firestore `id` yet. Persisted books are
// identified by `id` everywhere else (store updates/removal, routing).
export function booksEqual(a: BookModel, b: BookModel): boolean {
  return a.title.toLowerCase() === b.title.toLowerCase();
}
