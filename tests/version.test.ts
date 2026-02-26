import { describe, it, expect } from 'vitest';
import { bumpVersion, suggestBump } from '../src/version';
import { RawCommit } from '../src/types';

// ── bumpVersion ──────────────────────────────────────────────────────

describe('bumpVersion', () => {
    it('bumps major: 1.2.3 → 2.0.0', () => {
        expect(bumpVersion('1.2.3', 'major')).toBe('2.0.0');
    });

    it('bumps minor: 1.2.3 → 1.3.0', () => {
        expect(bumpVersion('1.2.3', 'minor')).toBe('1.3.0');
    });

    it('bumps patch: 1.2.3 → 1.2.4', () => {
        expect(bumpVersion('1.2.3', 'patch')).toBe('1.2.4');
    });

    it('bumps major from 0.0.0 → 1.0.0', () => {
        expect(bumpVersion('0.0.0', 'major')).toBe('1.0.0');
    });

    it('bumps minor from 0.0.0 → 0.1.0', () => {
        expect(bumpVersion('0.0.0', 'minor')).toBe('0.1.0');
    });

    it('bumps patch from 0.0.0 → 0.0.1', () => {
        expect(bumpVersion('0.0.0', 'patch')).toBe('0.0.1');
    });

    it('resets minor and patch on major bump', () => {
        expect(bumpVersion('3.7.12', 'major')).toBe('4.0.0');
    });

    it('resets patch on minor bump', () => {
        expect(bumpVersion('3.7.12', 'minor')).toBe('3.8.0');
    });

    it('throws on invalid version format', () => {
        expect(() => bumpVersion('not.a.version', 'patch')).toThrow();
    });
});

// ── suggestBump ──────────────────────────────────────────────────────

describe('suggestBump', () => {
    function commits(...messages: string[]): RawCommit[] {
        return messages.map((m, i) => ({ hash: `abc${i}`, message: m }));
    }

    it('returns major for BREAKING CHANGE in message', () => {
        expect(suggestBump(commits('fix: something', 'refactor: BREAKING CHANGE stuff'))).toBe(
            'major',
        );
    });

    it('returns major for ! in conventional prefix', () => {
        expect(suggestBump(commits('feat!: remove old api'))).toBe('major');
    });

    it('returns major for scoped breaking: feat(api)!: msg', () => {
        expect(suggestBump(commits('feat(api)!: drop v1'))).toBe('major');
    });

    it('returns minor for feat commits', () => {
        expect(suggestBump(commits('feat: add login', 'chore: deps'))).toBe('minor');
    });

    it('returns minor for feat with scope', () => {
        expect(suggestBump(commits('feat(ui): add button'))).toBe('minor');
    });

    it('returns patch for fix commits only', () => {
        expect(suggestBump(commits('fix: null pointer', 'chore: deps'))).toBe('patch');
    });

    it('returns patch for fix with scope', () => {
        expect(suggestBump(commits('fix(auth): token expiry'))).toBe('patch');
    });

    it('returns null for no feat/fix/breaking', () => {
        expect(suggestBump(commits('chore: bump deps', 'docs: update readme'))).toBeNull();
    });

    it('returns null for empty commit list', () => {
        expect(suggestBump([])).toBeNull();
    });

    it('major takes precedence over minor and patch', () => {
        expect(
            suggestBump(commits('feat: add feature', 'fix: bug', 'refactor!: breaking')),
        ).toBe('major');
    });

    it('minor takes precedence over patch', () => {
        expect(suggestBump(commits('fix: bug', 'feat: new feature'))).toBe('minor');
    });
});
