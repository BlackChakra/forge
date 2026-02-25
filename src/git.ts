import simpleGit, { SimpleGit } from 'simple-git';
import { CommitCategory, ParsedCommit, GroupedCommits } from './types';

const git: SimpleGit = simpleGit();

// ── Prefix → Category mapping ───────────────────────────────────────
const PREFIX_MAP: Record<string, CommitCategory> = {
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

// ── Conventional commit regex ────────────────────────────────────────
// Matches: "type(scope): message" or "type: message"
const CONVENTIONAL_RE = /^(\w+)(?:\(([^)]*)\))?:\s*(.+)$/;

/**
 * Get the most recent semver-like tag reachable from HEAD.
 * Returns null if no tags exist.
 */
export async function getLatestTag(): Promise<string | null> {
    try {
        const result = await git.raw(['describe', '--tags', '--abbrev=0']);
        return result.trim() || null;
    } catch {
        return null;
    }
}

/**
 * Retrieve commits from `sinceRef` to HEAD.
 * If sinceRef is null, returns the last `limit` commits.
 */
export async function getCommitsSince(
    sinceRef: string | null,
    limit: number = 200,
): Promise<Array<{ hash: string; message: string }>> {
    const LOG_FORMAT = '%H||%s'; // hash||subject
    let raw: string;

    if (sinceRef) {
        raw = await git.raw([
            'log',
            `${sinceRef}..HEAD`,
            `--pretty=format:${LOG_FORMAT}`,
        ]);
    } else {
        raw = await git.raw([
            'log',
            `-${limit}`,
            `--pretty=format:${LOG_FORMAT}`,
        ]);
    }

    if (!raw.trim()) return [];

    return raw
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((line) => {
            const [hash, ...rest] = line.split('||');
            return { hash: hash.trim(), message: rest.join('||').trim() };
        });
}

/**
 * Parse a single commit message into a ParsedCommit.
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
 * Create an empty GroupedCommits record.
 */
function emptyGrouped(): GroupedCommits {
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
 * Get commits since the latest tag (or last 200), parsed and grouped.
 */
export async function getCommitsGrouped(): Promise<{
    grouped: GroupedCommits;
    tag: string | null;
    totalCommits: number;
}> {
    const tag = await getLatestTag();
    const commits = await getCommitsSince(tag);
    const grouped = emptyGrouped();

    for (const { hash, message } of commits) {
        const parsed = parseCommitMessage(hash, message);
        grouped[parsed.category].push(parsed);
    }

    return { grouped, tag, totalCommits: commits.length };
}
