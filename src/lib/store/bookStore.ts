import { create } from 'zustand';
import { BookModel, booksEqual } from '../models/BookModel';
import { fetchBooks } from '../firebase/firestore';

interface BookState {
  books: BookModel[];
  loading: boolean;
  loadBooks: (ownerId: string) => Promise<void>;
  addBookLocal: (book: BookModel) => void;
  updateBookLocal: (book: BookModel) => void;
  removeBookLocal: (book: BookModel) => void;
  clear: () => void;
}

export const useBookStore = create<BookState>((set, get) => ({
  books: [],
  loading: false,
  loadBooks: async (ownerId: string) => {
    set({ loading: true });
    try {
      const books = await fetchBooks(ownerId);
      set({ books, loading: false });
    } catch (e) {
      console.error('Failed to load books', e);
      set({ loading: false });
    }
  },
  addBookLocal: (book) => set({ books: [...get().books, book] }),
  // NOTE: booksEqual (and therefore update/remove below) matches by title
  // only. Duplicate titles are a known, accepted limitation inherited from
  // the mobile app's spec-mandated identity semantics.
  updateBookLocal: (book) =>
    set({
      books: get().books.map((b) => (booksEqual(b, book) ? book : b)),
    }),
  removeBookLocal: (book) =>
    set({ books: get().books.filter((b) => !booksEqual(b, book)) }),
  clear: () => set({ books: [] }),
}));
