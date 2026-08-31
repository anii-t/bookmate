import axios from 'axios';

const BASE_URL = 'https://openlibrary.org';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'User-Agent': 'BookMate-Web/1.0 (https://github.com)',
  },
});

export interface DocumentResponse {
  key?: string;
  author_name?: string[];
  subject?: string[];
  title?: string;
  isbn?: string[];
  isbn_10?: string[];
  isbn_13?: string[];
  cover_i?: number;
  first_publish_year?: number;
}

export interface BookResponse {
  numFound: number;
  start: number;
  numFoundExact: boolean;
  docs: DocumentResponse[];
}

export async function searchByISBN(isbn: string): Promise<BookResponse> {
  const response = await client.get<BookResponse>('/search.json', {
    params: { isbn },
  });
  return response.data;
}

export async function searchByTitle(title: string): Promise<BookResponse> {
  const response = await client.get<BookResponse>('/search.json', {
    params: { title },
  });
  return response.data;
}

export type OpenLibrarySearchParams = {
  q?: string;
  author?: string;
  subject?: string;
  title?: string;
  sort?: string;
  language?: string;
  limit?: number;
  offset?: number;
};

export async function searchOpenLibrary(
  params: OpenLibrarySearchParams
): Promise<BookResponse> {
  const { sort = 'rating', language, limit = 40, q, author, subject, title, offset } = params;
  const apiParams: Record<string, string | number> = {
    sort,
    limit: Math.min(Math.max(1, limit), 100),
  };
  if (language) apiParams.language = language;
  if (q) apiParams.q = q;
  if (author) apiParams.author = author;
  if (subject) apiParams.subject = subject;
  if (title) apiParams.title = title;
  if (offset != null && offset > 0) {
    apiParams.offset = offset;
  }

  const response = await client.get<BookResponse>('/search.json', {
    params: apiParams,
  });
  return response.data;
}
