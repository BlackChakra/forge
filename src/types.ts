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

// ── Raw commit (before parsing) ──────────────────────────────────────
export interface RawCommit {
    readonly hash: string;
    readonly message: string;
}

// ── Parsed commit (after categorization) ─────────────────────────────
export interface ParsedCommit {
    readonly hash: string;
    readonly message: string;
    readonly category: CommitCategory;
    readonly scope?: string;
}

// ── Grouped commits (one readonly array per category) ────────────────
export type GroupedCommits = Readonly<Record<CommitCategory, readonly ParsedCommit[]>>;

// ── Mutable version used internally during grouping ──────────────────
export type MutableGroupedCommits = Record<CommitCategory, ParsedCommit[]>;

// ── Result of analyzing commits ──────────────────────────────────────
export interface CommitSummary {
    readonly grouped: GroupedCommits;
    readonly tag: string | null;
    readonly totalCommits: number;
}

// ── Scaffold file definition ─────────────────────────────────────────
export interface ScaffoldFile {
    readonly relativePath: string;
    readonly content: string;
}

// ── Command Options ──────────────────────────────────────────────────
export interface InitOptions {
    readonly force: boolean;
}

export interface ReleaseOptions {
    readonly version: string;
    readonly write: boolean;
}
