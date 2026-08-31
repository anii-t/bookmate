import { BorrowingStatus } from './enums';

export interface BorrowingModel {
  borrowingStatus: BorrowingStatus;
  name: string;
  date: string;
}

export function createDefaultBorrowing(): BorrowingModel {
  return {
    borrowingStatus: BorrowingStatus.NOT_BORROWED,
    name: '',
    date: '',
  };
}
