import { BookModel } from '../models/BookModel';
import { ListType, ReadingStatus } from '../models/enums';
import { createDefaultBorrowing } from '../models/BorrowingModel';
import { createDefaultRating } from '../models/RatingModel';
import { BookResponse, DocumentResponse } from './bookService';
import { UserModel } from '../models/UserModel';
import { normalizeIsbnInput } from '../utils/isbn';

const KNOWN_GENRES = new Set([
  'fiction', 'non-fiction', 'nonfiction', 'mystery', 'thriller', 'romance',
  'fantasy', 'science fiction', 'horror', 'historical fiction', 'biography',
  'autobiography', 'memoir', 'poetry', 'self-help', 'business', 'travel',
  "children's literature", 'young adult', 'crime', 'adventure', 'humor',
  'drama', 'satire', 'philosophy', 'religion', 'art', 'cooking', 'science', 'health',
]);

function getGenres(subjects?: string[]): string[] {
  if (!subjects) return [];
  const result: string[] = [];
  const seen = new Set<string>();
  const limit = Math.min(subjects.length, 20);
  for (let i = 0; i < limit; i++) {
    const lower = subjects[i].toLowerCase();
    for (const known of KNOWN_GENRES) {
      if (lower.includes(known) && !seen.has(known)) {
        seen.add(known);
        result.push(known.charAt(0).toUpperCase() + known.slice(1));
        break;
      }
    }
    if (result.length >= 3) break;
  }
  return result;
}

function firstIsbnFromDoc(doc: DocumentResponse): string {
  const candidates = [
    ...(doc.isbn ?? []),
    ...(doc.isbn_13 ?? []),
    ...(doc.isbn_10 ?? []),
  ];
  const raw = candidates[0] ?? '';
  return raw ? normalizeIsbnInput(raw) : '';
}

function docToBook(doc: DocumentResponse, ownerId: string, listType: ListType): BookModel {
  const isbn = firstIsbnFromDoc(doc);
  const author = doc.author_name?.[0] ?? '';
  const title = doc.title ?? '';
  const coverId = doc.cover_i ?? 0;
  const coverUrl = coverId !== 0 ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : '';
  const genres = getGenres(doc.subject);

  return {
    ISBN: isbn,
    coverUrl,
    author,
    title,
    genres,
    readingStatus: ReadingStatus.NOT_STARTED,
    borrowing: createDefaultBorrowing(),
    rating: createDefaultRating(),
    listType,
    ownerId,
  };
}

export function convertToBook(response: BookResponse, user: UserModel): BookModel | null {
  if (!response.docs || response.docs.length === 0) return null;
  return docToBook(response.docs[0], user.id, ListType.LIBRARY);
}

export function convertToBookList(
  response: BookResponse,
  existingBooks: BookModel[]
): BookModel[] {
  if (!response.docs) return [];

  const existingTitles = new Set(existingBooks.map((b) => b.title.toLowerCase()));
  const result: BookModel[] = [];

  for (const doc of response.docs) {
    const title = doc.title?.trim();
    if (!title) continue;

    if (!existingTitles.has(title.toLowerCase())) {
      result.push(docToBook(doc, '', ListType.LIBRARY));
      existingTitles.add(title.toLowerCase());
    }

    if (result.length >= 20) break;
  }

  return result;
}

export function convertDocumentsToBookList(
  docs: DocumentResponse[],
  existingBooks: BookModel[],
  maxResults?: number
): BookModel[] {
  const existingTitles = new Set(existingBooks.map((b) => b.title.toLowerCase()));
  const existingIsbns = new Set(
    existingBooks.map((b) => b.ISBN).filter((isbn) => isbn.length > 0)
  );
  const result: BookModel[] = [];

  for (const doc of docs) {
    const title = doc.title?.trim();
    if (!title) continue;
    if (existingTitles.has(title.toLowerCase())) continue;

    const book = docToBook(doc, '', ListType.LIBRARY);
    if (book.ISBN && existingIsbns.has(book.ISBN)) continue;

    result.push(book);
    existingTitles.add(title.toLowerCase());
    if (book.ISBN) existingIsbns.add(book.ISBN);

    if (maxResults != null && result.length >= maxResults) break;
  }

  return result;
}
