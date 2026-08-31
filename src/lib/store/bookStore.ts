import { create } from 'zustand';
import { BookModel } from '../models/BookModel';
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
  // Matched by Firestore document id — callers must pass a book that already
  // has one (i.e. after `addBook`/`fetchBooks`, never a pre-persist object).
  updateBookLocal: (book) =>
    set({
      books: get().books.map((b) => (b.id && b.id === book.id ? book : b)),
    }),
  removeBookLocal: (book) =>
    set({ books: get().books.filter((b) => !(b.id && b.id === book.id)) }),
  clear: () => set({ books: [] }),
}));
