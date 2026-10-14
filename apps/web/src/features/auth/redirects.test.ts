import { describe, expect, it } from 'vitest';
import { loginPathFor, safeNextPath } from './redirects';

describe('safeNextPath', () => {
  it('keeps a same-site path with its query', () => {
    expect(safeNextPath('/jobs?page=2')).toBe('/jobs?page=2');
  });

  it.each([
    ['missing', null],
    ['empty', ''],
    ['an absolute URL', 'https://evil.example'],
    ['a protocol-relative URL', '//evil.example'],
    ['a backslash trick', '/\\evil.example'],
    ['a javascript: URL', 'javascript:alert(1)'],
  ])('falls back to / for %s', (_name, next) => {
    expect(safeNextPath(next)).toBe('/');
  });
});

describe('loginPathFor', () => {
  it('remembers the page the user was going to', () => {
    expect(loginPathFor('/jobs?page=2')).toBe('/login?next=%2Fjobs%3Fpage%3D2');
  });

  it('uses plain /login for the home page', () => {
    expect(loginPathFor('/')).toBe('/login');
  });
});
