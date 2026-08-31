import {
  collection,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import { BookModel } from '../models/BookModel';
import { UserModel } from '../models/UserModel';
import { ListType, ReadingStatus, BorrowingStatus } from '../models/enums';

function bookToFirestore(book: BookModel): Record<string, any> {
  return {
    ISBN: book.ISBN,
    coverUrl: book.coverUrl,
    author: book.author,
    title: book.title,
    genres: book.genres,
    readingStatus: book.readingStatus,
    borrowingStatus: book.borrowing.borrowingStatus,
    borrowingName: book.borrowing.name,
    borrowingDate: book.borrowing.date,
    emotionalImpact: book.rating.emotionalImpact,
    character: book.rating.character,
    pacing: book.rating.pacing,
    storyline: book.rating.storyline,
    writingStyle: book.rating.writingStyle,
    overallRating: book.rating.overallRating,
    listType: book.listType,
    ownerId: book.ownerId,
  };
}

function firestoreToBook(id: string, data: Record<string, any>): BookModel {
  return {
    id,
    ISBN: data.ISBN ?? '',
    coverUrl: data.coverUrl ?? '',
    author: data.author ?? '',
    title: data.title ?? '',
    genres: Array.isArray(data.genres) ? data.genres : [],
    readingStatus: (data.readingStatus as ReadingStatus) ?? ReadingStatus.NOT_STARTED,
    borrowing: {
      borrowingStatus: (data.borrowingStatus as BorrowingStatus) ?? BorrowingStatus.NOT_BORROWED,
      name: data.borrowingName ?? '',
      date: data.borrowingDate ?? '',
    },
    rating: {
      emotionalImpact: data.emotionalImpact ?? 0,
      character: data.character ?? 0,
      pacing: data.pacing ?? 0,
      storyline: data.storyline ?? 0,
      writingStyle: data.writingStyle ?? 0,
      overallRating: data.overallRating ?? 0,
    },
    listType: (data.listType as ListType) ?? ListType.LIBRARY,
    ownerId: data.ownerId ?? '',
  };
}

export async function addUser(user: UserModel): Promise<void> {
  await setDoc(doc(db, 'users', user.id), user);
}

export async function deleteUser(user: UserModel): Promise<void> {
  await deleteDoc(doc(db, 'users', user.id));
}

/** Creates a new book document and returns its Firestore-assigned ID. */
export async function addBook(book: BookModel): Promise<string> {
  const ref = await addDoc(collection(db, 'books'), bookToFirestore(book));
  return ref.id;
}

export async function updateBook(book: BookModel): Promise<void> {
  if (!book.id) {
    console.warn('Firestore updateBook: book has no id, cannot update.');
    return;
  }
  await setDoc(doc(db, 'books', book.id), bookToFirestore(book));
}

export async function fetchBooks(ownerId: string): Promise<BookModel[]> {
  const q = query(collection(db, 'books'), where('ownerId', '==', ownerId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => firestoreToBook(d.id, d.data()));
}

export async function deleteBook(book: BookModel): Promise<void> {
  if (!book.id) {
    console.warn('Firestore deleteBook: book has no id, cannot delete.');
    return;
  }
  await deleteDoc(doc(db, 'books', book.id));
}

export async function deleteAllBooks(ownerId: string): Promise<void> {
  const q = query(collection(db, 'books'), where('ownerId', '==', ownerId));
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}
