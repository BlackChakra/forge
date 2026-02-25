// ── Commit Categories ────────────────────────────────────────────────
export enum CommitCategory {
    Features = 'Features',
    Fixes = 'Fixes',
    Docs = 'Docs',
    Refactors = 'Refactors',
    Tests = 'Tests',
    Chores = 'Chores',
    Other = 'Other',
}

// ── Parsed Commit ────────────────────────────────────────────────────
export interface ParsedCommit {
    hash: string;
    message: string;
    category: CommitCategory;
    scope?: string;
}

// ── Grouped Commits (one array per category) ─────────────────────────
export type GroupedCommits = Record<CommitCategory, ParsedCommit[]>;

// ── Command Options ──────────────────────────────────────────────────
export interface InitOptions {
    force: boolean;
}

export interface ReleaseOptions {
    version: string;
    write: boolean;
}
