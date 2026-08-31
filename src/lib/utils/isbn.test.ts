import { describe, it, expect } from 'vitest';
import { normalizeIsbnInput } from './isbn';

describe('normalizeIsbnInput', () => {
  it('strips non-digit, non-X characters and uppercases', () => {
    expect(normalizeIsbnInput('978-0-13-468599-1')).toBe('9780134685991');
    expect(normalizeIsbnInput('080442957x')).toBe('080442957X');
  });
});
