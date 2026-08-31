import { ListType, ReadingStatus } from './enums';
import { BorrowingModel, createDefaultBorrowing } from './BorrowingModel';
import { RatingModel, createDefaultRating } from './RatingModel';

export interface BookModel {
  id?: number;
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

// NOTE (known, accepted limitation): identity is title-only (case-insensitive),
// ported verbatim from the mobile app's spec-mandated behavior. Two distinct
// books that happen to share a title will collide here (and in routing that
// keys off title). Do not silently "fix" by changing semantics — see review
// finding for details.
export function booksEqual(a: BookModel, b: BookModel): boolean {
  return a.title.toLowerCase() === b.title.toLowerCase();
}
