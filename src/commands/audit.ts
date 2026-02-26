import { getGitClient } from '../git';
import { runAllChecks, computeExitCode, formatCheckLine, realFs, GitInfo } from '../audit';
import { logger } from '../logger';

// ── Gather git info ──────────────────────────────────────────────────

async function gatherGitInfo(): Promise<GitInfo> {
    const client = getGitClient();

    let isGitRepo = true;
    try {
        await client.checkGitAvailable();
    } catch {
        isGitRepo = false;
    }

    if (!isGitRepo) {
        return { isGitRepo: false, hasCommits: false, hasTag: false };
    }

    let hasCommits = false;
    try {
        const commits = await client.getCommitsSince(null, 1);
        hasCommits = commits.length > 0;
    } catch {
        // already false
    }

    let hasTag = false;
    try {
        const tag = await client.getLatestTag();
        hasTag = tag !== null;
    } catch {
        // already false
    }

    return { isGitRepo, hasCommits, hasTag };
}

// ── Command handler ──────────────────────────────────────────────────

export async function runAudit(): Promise<void> {
    const cwd = process.cwd();
    const git = await gatherGitInfo();
    const results = runAllChecks(git, realFs, cwd);

    for (const result of results) {
        logger.raw(formatCheckLine(result));
    }

    const exitCode = computeExitCode(results);
    if (exitCode === 0) {
        logger.blank();
        logger.success('All checks passed.');
    } else {
        logger.blank();
        const fails = results.filter((r) => r.status === 'FAIL').length;
        const warns = results.filter((r) => r.status === 'WARN').length;
        logger.raw(`${fails} failed, ${warns} warnings.`);
    }

    process.exitCode = exitCode;
}
