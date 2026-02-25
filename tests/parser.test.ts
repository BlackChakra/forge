import { describe, it, expect } from 'vitest';
import { parseCommitMessage } from '../src/git/parser';
import { CommitCategory } from '../src/types';

describe('parseCommitMessage', () => {
  // ── Conventional prefixes ──────────────────────────────────────────
  const prefixCases: [string, CommitCategory][] = [
    ['feat: add login', CommitCategory.Features],
    ['feature: add login', CommitCategory.Features],
    ['perf: speed up query', CommitCategory.Features],
    ['fix: null pointer', CommitCategory.Fixes],
    ['bugfix: crash on load', CommitCategory.Fixes],
    ['docs: update readme', CommitCategory.Docs],
    ['doc: add jsdoc', CommitCategory.Docs],
    ['refactor: extract method', CommitCategory.Refactors],
    ['test: add unit test', CommitCategory.Tests],
    ['tests: add integration', CommitCategory.Tests],
    ['chore: bump deps', CommitCategory.Chores],
    ['ci: add workflow', CommitCategory.Chores],
    ['build: update webpack', CommitCategory.Chores],
    ['style: fix whitespace', CommitCategory.Chores],
  ];

  it.each(prefixCases)('"%s" → %s', (message, expectedCategory) => {
    const result = parseCommitMessage('abc1234', message);
    expect(result.category).toBe(expectedCategory);
  });

  // ── Unknown / no prefix ────────────────────────────────────────────
  it('unknown prefix maps to Other', () => {
    const result = parseCommitMessage('abc1234', 'random: do something');
    expect(result.category).toBe(CommitCategory.Other);
  });

  it('no prefix maps to Other', () => {
    const result = parseCommitMessage('abc1234', 'just a plain message');
    expect(result.category).toBe(CommitCategory.Other);
    expect(result.message).toBe('just a plain message');
  });

  // ── Scope extraction ───────────────────────────────────────────────
  it('extracts scope from feat(auth): msg', () => {
    const result = parseCommitMessage('abc1234', 'feat(auth): add login');
    expect(result.scope).toBe('auth');
    expect(result.message).toBe('add login');
    expect(result.category).toBe(CommitCategory.Features);
  });

  it('scope is undefined when not provided', () => {
    const result = parseCommitMessage('abc1234', 'feat: add login');
    expect(result.scope).toBeUndefined();
  });

  // ── Case insensitivity ─────────────────────────────────────────────
  it('handles uppercase prefix FEAT:', () => {
    const result = parseCommitMessage('abc1234', 'FEAT: add login');
    expect(result.category).toBe(CommitCategory.Features);
  });

  it('handles mixed case Fix:', () => {
    const result = parseCommitMessage('abc1234', 'Fix: resolve bug');
    expect(result.category).toBe(CommitCategory.Fixes);
  });

  // ── Hash preservation ──────────────────────────────────────────────
  it('preserves the full hash', () => {
    const result = parseCommitMessage('abc1234def5678', 'feat: something');
    expect(result.hash).toBe('abc1234def5678');
  });

  // ── Message trimming ───────────────────────────────────────────────
  it('trims whitespace from message body', () => {
    const result = parseCommitMessage('abc1234', 'feat:   lots of spaces  ');
    expect(result.message).toBe('lots of spaces');
  });
});
