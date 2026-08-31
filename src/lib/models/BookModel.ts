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

export function booksEqual(a: BookModel, b: BookModel): boolean {
  return a.title.toLowerCase() === b.title.toLowerCase();
}
