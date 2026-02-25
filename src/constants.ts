import { CommitCategory } from './types';

// ── Git ──────────────────────────────────────────────────────────────
export const LOG_DELIMITER = '||';
export const DEFAULT_COMMIT_LIMIT = 200;
export const COMMIT_HASH_SHORT_LENGTH = 7;

// ── File names ───────────────────────────────────────────────────────
export const CHANGELOG_FILENAME = 'CHANGELOG.md';
export const GENERATED_PR_FILENAME = 'PR_DESCRIPTION.generated.md';
export const CHANGELOG_HEADER = '# Changelog';

// ── Category display order ───────────────────────────────────────────
export const CATEGORY_ORDER: readonly CommitCategory[] = [
    CommitCategory.Features,
    CommitCategory.Fixes,
    CommitCategory.Docs,
    CommitCategory.Refactors,
    CommitCategory.Tests,
    CommitCategory.Chores,
    CommitCategory.Other,
] as const;

// ── Conventional commit prefix → category mapping ────────────────────
export const PREFIX_MAP: Readonly<Record<string, CommitCategory>> = {
    feat: CommitCategory.Features,
    feature: CommitCategory.Features,
    fix: CommitCategory.Fixes,
    bugfix: CommitCategory.Fixes,
    docs: CommitCategory.Docs,
    doc: CommitCategory.Docs,
    refactor: CommitCategory.Refactors,
    test: CommitCategory.Tests,
    tests: CommitCategory.Tests,
    chore: CommitCategory.Chores,
    ci: CommitCategory.Chores,
    build: CommitCategory.Chores,
    style: CommitCategory.Chores,
    perf: CommitCategory.Features,
};
