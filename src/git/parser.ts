import {
    CommitCategory,
    ParsedCommit,
    MutableGroupedCommits,
    GroupedCommits,
} from '../types';
import { PREFIX_MAP } from '../constants';

// ── Conventional commit regex ────────────────────────────────────────
// Matches: "type(scope): message" or "type: message"
const CONVENTIONAL_RE = /^(\w+)(?:\(([^)]*)\))?:\s*(.+)$/;

/**
 * Parse a single commit message into a categorized ParsedCommit.
 * Pure function — no I/O, no side effects.
 */
export function parseCommitMessage(
    hash: string,
    message: string,
): ParsedCommit {
    const match = CONVENTIONAL_RE.exec(message);

    if (match) {
        const [, prefix, scope, body] = match;
        const category =
            PREFIX_MAP[prefix.toLowerCase()] ?? CommitCategory.Other;
        return {
            hash,
            message: body.trim(),
            category,
            scope: scope || undefined,
        };
    }

    return { hash, message, category: CommitCategory.Other };
}

/**
 * Create an empty mutable grouped commits record.
 */
export function createEmptyGroups(): MutableGroupedCommits {
    return {
        [CommitCategory.Features]: [],
        [CommitCategory.Fixes]: [],
        [CommitCategory.Docs]: [],
        [CommitCategory.Refactors]: [],
        [CommitCategory.Tests]: [],
        [CommitCategory.Chores]: [],
        [CommitCategory.Other]: [],
    };
}

/**
 * Freeze a mutable grouped commits record into its readonly form.
 */
export function freezeGroups(mutable: MutableGroupedCommits): GroupedCommits {
    return mutable as GroupedCommits;
}
