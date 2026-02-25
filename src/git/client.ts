import simpleGit, { SimpleGit } from 'simple-git';
import { RawCommit, CommitSummary } from '../types';
import { LOG_DELIMITER, DEFAULT_COMMIT_LIMIT } from '../constants';
import { GitError } from '../errors';
import { parseCommitMessage, createEmptyGroups, freezeGroups } from './parser';

// ── GitClient ────────────────────────────────────────────────────────
// Encapsulates all git operations. Accepts a SimpleGit instance via
// constructor for dependency injection (testability).

export class GitClient {
    private readonly git: SimpleGit;

    constructor(git?: SimpleGit) {
        this.git = git ?? simpleGit();
    }

    /**
     * Get the most recent semver-like tag reachable from HEAD.
     * Returns null if no tags exist.
     */
    async getLatestTag(): Promise<string | null> {
        try {
            const result = await this.git.raw([
                'describe',
                '--tags',
                '--abbrev=0',
            ]);
            return result.trim() || null;
        } catch {
            return null;
        }
    }

    /**
     * Retrieve commits from `sinceRef` to HEAD.
     * If sinceRef is null, returns the last `limit` commits.
     */
    async getCommitsSince(
        sinceRef: string | null,
        limit: number = DEFAULT_COMMIT_LIMIT,
    ): Promise<readonly RawCommit[]> {
        const format = `%H${LOG_DELIMITER}%s`;

        try {
            const args = sinceRef
                ? ['log', `${sinceRef}..HEAD`, `--pretty=format:${format}`]
                : ['log', `-${limit}`, `--pretty=format:${format}`];

            const raw = await this.git.raw(args);

            if (!raw.trim()) return [];

            return raw
                .trim()
                .split('\n')
                .filter(Boolean)
                .map((line): RawCommit => {
                    const [hash, ...rest] = line.split(LOG_DELIMITER);
                    return {
                        hash: hash.trim(),
                        message: rest.join(LOG_DELIMITER).trim(),
                    };
                });
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            throw new GitError(`Failed to read git log: ${message}`);
        }
    }

    /**
     * Get commits since the latest tag (or last N), parsed and grouped.
     */
    async getCommitsGrouped(): Promise<CommitSummary> {
        const tag = await this.getLatestTag();
        const commits = await this.getCommitsSince(tag);
        const grouped = createEmptyGroups();

        for (const { hash, message } of commits) {
            const parsed = parseCommitMessage(hash, message);
            grouped[parsed.category].push(parsed);
        }

        return {
            grouped: freezeGroups(grouped),
            tag,
            totalCommits: commits.length,
        };
    }
}

// ── Default singleton ────────────────────────────────────────────────

let defaultClient: GitClient | null = null;

export function getGitClient(): GitClient {
    if (!defaultClient) {
        defaultClient = new GitClient();
    }
    return defaultClient;
}
