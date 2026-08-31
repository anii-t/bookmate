import { BookModel } from '../models/BookModel';
import { ReadingStatus } from '../models/enums';
import { DocumentResponse, searchOpenLibrary } from '../network/bookService';
import { convertDocumentsToBookList } from '../network/bookModelCreator';

const RATING_MAX = 5;
const MAX_API_CALLS = 8;
const MAX_PER_AUTHOR = 5;
/** Score-ranked slice before per-author diversity */
const RANK_POOL = 2000;
const OL_PAGE = 100;
const MORE_OFFSET_STEP = 60;
const MORE_PROBES = 4;
const MORE_BATCH_CAP = 80;

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'from',
  'that',
  'this',
  'book',
  'novel',
  'vol',
  'volume',
  'part',
]);

export interface WeightedLabel {
  label: string;
  weight: number;
}

export interface TasteProfile {
  authors: WeightedLabel[];
  genres: WeightedLabel[];
}

function perBookTasteWeight(book: BookModel): number {
  let w = 1;
  const r = book.rating.overallRating;
  if (r > 0) {
    w += (Math.min(r, RATING_MAX) / RATING_MAX) * 3;
  }
  switch (book.readingStatus) {
    case ReadingStatus.FINISHED:
      w += 1.5;
      break;
    case ReadingStatus.IN_PROGRESS:
      w += 0.75;
      break;
    case ReadingStatus.PAUSED:
      w += 0.3;
      break;
    default:
      break;
  }
  return w;
}

/** Aggregates authors & genres from the library, weighted by ratings + reading progress. */
export function buildTasteProfile(books: BookModel[]): TasteProfile {
  const authorMap = new Map<string, { w: number; display: string }>();
  const genreMap = new Map<string, { w: number; display: string }>();

  for (const b of books) {
    const tw = perBookTasteWeight(b);
    const au = b.author?.trim();
    if (au) {
      const k = au.toLowerCase();
      const cur = authorMap.get(k);
      if (!cur) {
        authorMap.set(k, { w: tw, display: au });
      } else {
        authorMap.set(k, { w: cur.w + tw, display: cur.display });
      }
    }
    for (const g of b.genres) {
      const gt = g?.trim();
      if (!gt) continue;
      const k = gt.toLowerCase();
      const cur = genreMap.get(k);
      if (!cur) {
        genreMap.set(k, { w: tw, display: gt });
      } else {
        genreMap.set(k, { w: cur.w + tw, display: cur.display });
      }
    }
  }

  const authors = [...authorMap.values()]
    .sort((a, b) => b.w - a.w)
    .map((v) => ({ label: v.display, weight: v.w }));

  const genres = [...genreMap.values()]
    .sort((a, b) => b.w - a.w)
    .map((v) => ({ label: v.display, weight: v.w }));

  return { authors, genres };
}

export function docDedupeKey(doc: DocumentResponse): string {
  if (doc.key) return doc.key;
  const t = (doc.title ?? '').trim().toLowerCase();
  const a = (doc.author_name?.[0] ?? '').trim().toLowerCase();
  return `${t}::${a}`;
}

function scoreDocument(doc: DocumentResponse, profile: TasteProfile): number {
  let s = 0;
  const authors = doc.author_name?.map((x) => x.toLowerCase()) ?? [];
  const subjects = doc.subject?.map((x) => x.toLowerCase()) ?? [];

  for (const { label, weight } of profile.authors) {
    const l = label.toLowerCase();
    if (authors.some((a) => a.includes(l) || l.includes(a))) {
      s += weight * 2.2;
    }
  }

  for (const { label, weight } of profile.genres) {
    const l = label.toLowerCase();
    for (const sub of subjects) {
      if (sub.includes(l) || (l.length >= 4 && sub.includes(l.slice(0, 10)))) {
        s += weight * 1.45;
        break;
      }
    }
  }

  if (doc.cover_i) {
    s += 0.35;
  }

  const y = doc.first_publish_year;
  if (y != null && y >= 1990) {
    s += Math.min(0.45, (y - 1985) * 0.006);
  }

  return s;
}

function extractTitleKeyword(books: BookModel[]): string | null {
  for (const b of books) {
    const parts = (b.title ?? '').split(/\s+/);
    for (const part of parts) {
      const t = part.replace(/[^a-zA-ZÀ-ÿ]/g, '').toLowerCase();
      if (t.length >= 4 && !STOP_WORDS.has(t)) {
        return part.replace(/[^a-zA-ZÀ-ÿ]/g, '');
      }
    }
  }
  return null;
}

/** Prefer popular authors you already read; avoid one author dominating the list. */
function diversifyByPrimaryAuthor(
  sortedDocs: DocumentResponse[],
  maxPerAuthor: number,
  poolCap: number
): DocumentResponse[] {
  const out: DocumentResponse[] = [];
  const counts = new Map<string, number>();
  const pool = sortedDocs.slice(0, poolCap);

  for (const doc of pool) {
    const name = (doc.author_name?.[0] ?? '').trim().toLowerCase() || '__unknown__';
    const n = counts.get(name) ?? 0;
    if (n >= maxPerAuthor) continue;
    counts.set(name, n + 1);
    out.push(doc);
  }

  return out;
}

async function gatherCandidateDocuments(
  library: BookModel[],
  profile: TasteProfile
): Promise<DocumentResponse[]> {
  const merged = new Map<string, DocumentResponse>();
  let apiCalls = 0;

  const mergeDocs = (docs: DocumentResponse[]) => {
    for (const d of docs) {
      const k = docDedupeKey(d);
      if (!merged.has(k)) merged.set(k, d);
    }
  };

  const run = async (fn: () => ReturnType<typeof searchOpenLibrary>) => {
    if (apiCalls >= MAX_API_CALLS) return;
    apiCalls += 1;
    try {
      const res = await fn();
      mergeDocs(res.docs ?? []);
    } catch {
      /* ignore failed probe — rate limits / bad params */
    }
  };

  for (const { label } of profile.authors.slice(0, 3)) {
    await run(() => searchOpenLibrary({ author: label, limit: OL_PAGE, sort: 'rating' }));
  }

  for (const { label } of profile.genres.slice(0, 2)) {
    await run(() => searchOpenLibrary({ subject: label, limit: OL_PAGE, sort: 'rating' }));
  }

  const topAuthor = profile.authors[0]?.label;
  const topGenre = profile.genres[0]?.label;
  if (topAuthor && topGenre) {
    await run(() =>
      searchOpenLibrary({
        q: `${topAuthor} OR ${topGenre}`,
        limit: OL_PAGE,
        sort: 'rating',
      })
    );
  }

  if (profile.authors.length === 0 && profile.genres.length === 0) {
    const keyword = extractTitleKeyword(library);
    if (keyword) {
      await run(() => searchOpenLibrary({ q: keyword, limit: OL_PAGE, sort: 'rating' }));
    }
  }

  if (merged.size < 14) {
    await run(() => searchOpenLibrary({ q: 'fiction', limit: OL_PAGE, sort: 'new' }));
  }

  if (merged.size < 8 && apiCalls < MAX_API_CALLS) {
    await run(() => searchOpenLibrary({ q: 'novel', limit: OL_PAGE, sort: 'rating' }));
  }

  return [...merged.values()];
}

/**
 * Fetches related works from Open Library using a taste profile, ranks by relevance,
 * diversifies by author, then maps to `BookModel`s excluding books already in the library.
 */
export async function fetchRankedRecommendations(library: BookModel[]): Promise<BookModel[]> {
  if (library.length === 0) return [];

  const profile = buildTasteProfile(library);
  const candidates = await gatherCandidateDocuments(library, profile);

  if (candidates.length === 0) return [];

  const scored = candidates.map((doc) => ({
    doc,
    score: scoreDocument(doc, profile),
  }));

  scored.sort((a, b) => b.score - a.score);
  const ordered = scored.map((x) => x.doc);

  const diversified = diversifyByPrimaryAuthor(ordered, MAX_PER_AUTHOR, RANK_POOL);

  return convertDocumentsToBookList(diversified, library);
}

/**
 * Additional pages for infinite scroll: probes Open Library with increasing offsets,
 * re-scores against the taste profile, and returns new books not already recommended or in the library.
 */
export async function fetchMoreRankedRecommendations(
  library: BookModel[],
  alreadyRecommended: BookModel[],
  pageIndex: number
): Promise<BookModel[]> {
  if (library.length === 0) return [];

  const profile = buildTasteProfile(library);
  const excludeList = [...library, ...alreadyRecommended];
  const merged = new Map<string, DocumentResponse>();

  const mergeDocs = (docs: DocumentResponse[]) => {
    for (const d of docs) {
      const k = docDedupeKey(d);
      if (!merged.has(k)) merged.set(k, d);
    }
  };

  const offset = Math.max(0, pageIndex) * MORE_OFFSET_STEP;

  const probes: (() => ReturnType<typeof searchOpenLibrary>)[] = [
    () => searchOpenLibrary({ q: 'fiction', limit: OL_PAGE, offset, sort: 'new' }),
    () => searchOpenLibrary({ q: 'fiction', limit: OL_PAGE, offset, sort: 'rating' }),
    () => searchOpenLibrary({ q: 'novel', limit: OL_PAGE, offset, sort: 'rating' }),
  ];

  if (profile.authors[0]) {
    probes.push(() =>
      searchOpenLibrary({
        author: profile.authors[0].label,
        limit: OL_PAGE,
        offset,
        sort: 'rating',
      })
    );
  }
  if (profile.genres[0]) {
    probes.push(() =>
      searchOpenLibrary({
        subject: profile.genres[0].label,
        limit: OL_PAGE,
        offset,
        sort: 'rating',
      })
    );
  }

  let ran = 0;
  for (const p of probes) {
    if (ran >= MORE_PROBES) break;
    ran += 1;
    try {
      const res = await p();
      mergeDocs(res.docs ?? []);
    } catch {
      /* rate limit / network */
    }
  }

  if (merged.size === 0) return [];

  const candidates = [...merged.values()];
  const scored = candidates.map((doc) => ({
    doc,
    score: scoreDocument(doc, profile),
  }));
  scored.sort((a, b) => b.score - a.score);
  const ordered = scored.map((x) => x.doc);
  const diversified = diversifyByPrimaryAuthor(ordered, MAX_PER_AUTHOR + 1, 400);

  return convertDocumentsToBookList(diversified, excludeList, MORE_BATCH_CAP);
}

/** Back-compat one-line query for tooling / tests (first probe only). */
export function buildRecommendationQuery(books: BookModel[]): string {
  const p = buildTasteProfile(books);
  const a = p.authors[0]?.label;
  const g = p.genres[0]?.label;
  if (a && g) return `${a} OR ${g}`;
  if (a) return a;
  if (g) return g;
  return 'fiction';
}
