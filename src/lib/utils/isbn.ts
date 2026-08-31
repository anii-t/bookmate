/**
 * Normalizes a scanned or typed ISBN/EAN: digits + ISBN-10 check letter X.
 */
export function normalizeIsbnInput(raw: string): string {
  return raw.replace(/[^0-9X]/gi, '').toUpperCase();
}
