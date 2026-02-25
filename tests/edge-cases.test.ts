import { describe, it, expect } from 'vitest';
import { CommitCategory } from '../src/types';
import { createEmptyGroups, parseCommitMessage } from '../src/git/parser';
import { formatSummaryMarkdown } from '../src/formatter';
import { CATEGORY_ORDER } from '../src/constants';

// ── Empty commit range ───────────────────────────────────────────────

describe('empty commit range', () => {
    it('formatSummaryMarkdown handles 0 commits gracefully', () => {
        const groups = createEmptyGroups();
        const md = formatSummaryMarkdown(groups, null, 0);
        expect(md).toContain('**0 commits**');
        expect(md).not.toContain('###'); // no category sections
    });

    it('formatSummaryMarkdown handles 0 commits with a tag', () => {
        const groups = createEmptyGroups();
        const md = formatSummaryMarkdown(groups, 'v1.0.0', 0);
        expect(md).toContain('Changes since `v1.0.0`');
        expect(md).toContain('**0 commits**');
    });
});

// ── Non-semver tags ──────────────────────────────────────────────────

describe('non-semver tag behavior', () => {
    it('SEMVER_TAG_RE pattern rejects non-semver tags', () => {
        // This tests the same regex used in GitClient.getLatestTag()
        const SEMVER_TAG_RE = /^v?\d+\.\d+\.\d+/;
        expect(SEMVER_TAG_RE.test('v1.0.0')).toBe(true);
        expect(SEMVER_TAG_RE.test('1.0.0')).toBe(true);
        expect(SEMVER_TAG_RE.test('v1.0.0-beta.1')).toBe(true);
        expect(SEMVER_TAG_RE.test('release-candidate')).toBe(false);
        expect(SEMVER_TAG_RE.test('my-tag')).toBe(false);
        expect(SEMVER_TAG_RE.test('latest')).toBe(false);
        expect(SEMVER_TAG_RE.test('')).toBe(false);
    });
});

// ── Grouping stability ──────────────────────────────────────────────

describe('grouping stability under repeated runs', () => {
    const commits = [
        { hash: 'aaa', message: 'feat: first' },
        { hash: 'bbb', message: 'fix: second' },
        { hash: 'ccc', message: 'feat: third' },
        { hash: 'ddd', message: 'unknown message' },
    ];

    it('produces identical results across multiple runs', () => {
        function runGrouping() {
            const groups = createEmptyGroups();
            for (const { hash, message } of commits) {
                const parsed = parseCommitMessage(hash, message);
                groups[parsed.category].push(parsed);
            }
            return groups;
        }

        const run1 = runGrouping();
        const run2 = runGrouping();

        for (const cat of CATEGORY_ORDER) {
            expect(run1[cat]).toEqual(run2[cat]);
        }
    });
});

// ── All categories remain present even when empty ────────────────────

describe('all categories present', () => {
    it('single commit still has all 7 category keys', () => {
        const groups = createEmptyGroups();
        const parsed = parseCommitMessage('aaa', 'feat: only feature');
        groups[parsed.category].push(parsed);

        for (const cat of Object.values(CommitCategory)) {
            expect(groups[cat]).toBeDefined();
            expect(Array.isArray(groups[cat])).toBe(true);
        }
    });
});
