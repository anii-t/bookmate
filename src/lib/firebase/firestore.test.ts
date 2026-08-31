import { describe, it, expect, vi } from 'vitest';

vi.mock('./config', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  addDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDocs: vi.fn(async () => ({ empty: true, docs: [] })),
  query: vi.fn(),
  where: vi.fn(),
  writeBatch: vi.fn(),
}));

import { fetchBooks } from './firestore';
import * as fs from 'firebase/firestore';

describe('fetchBooks', () => {
  it('queries the books collection filtered by ownerId and maps docs', async () => {
    (fs.getDocs as any).mockResolvedValueOnce({
      docs: [
        {
          data: () => ({
            ISBN: '123',
            title: 'Dune',
            author: 'Frank Herbert',
            ownerId: 'user-1',
          }),
        },
      ],
    });

    const books = await fetchBooks('user-1');
    expect(books).toHaveLength(1);
    expect(books[0].title).toBe('Dune');
    expect(books[0].ISBN).toBe('123');
  });
});
