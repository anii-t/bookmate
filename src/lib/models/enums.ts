export enum ListType {
  WISHLIST = 'WISHLIST',
  LIBRARY = 'LIBRARY',
}

export enum ReadingStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  PAUSED = 'Paused',
  FINISHED = 'Finished',
}

export enum BorrowingStatus {
  BORROWED = 'Borrowed',
  NOT_BORROWED = 'Not Borrowed',
}

export enum RatingType {
  EMOTIONAL_IMPACT = 'EMOTIONAL_IMPACT',
  CHARACTERS = 'CHARACTERS',
  PACING = 'PACING',
  STORYLINE = 'STORYLINE',
  WRITING_STYLE = 'WRITING_STYLE',
  OVERALL_RATING = 'OVERALL_RATING',
}

export enum SearchType {
  ISBN = 'ISBN',
  TITLE = 'TITLE',
}

export const ALL_READING_STATUSES: ReadingStatus[] = [
  ReadingStatus.NOT_STARTED,
  ReadingStatus.IN_PROGRESS,
  ReadingStatus.PAUSED,
  ReadingStatus.FINISHED,
];

export const ALL_BORROWING_STATUSES: BorrowingStatus[] = [
  BorrowingStatus.BORROWED,
  BorrowingStatus.NOT_BORROWED,
];
