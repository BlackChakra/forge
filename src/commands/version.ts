import { getGitClient } from '../git';
import { readVersion, bumpVersion, writeVersion, suggestBump, BumpType } from '../version';
import { ValidationError } from '../errors';
import { logger } from '../logger';

const VALID_BUMPS: readonly string[] = ['major', 'minor', 'patch'];

// ── Command handler ──────────────────────────────────────────────────

export async function runVersion(opts: {
    bump?: string;
    tag?: boolean;
    suggest?: boolean;
}): Promise<void> {
    // Mutual exclusivity
    if (opts.bump && opts.suggest) {
        throw new ValidationError('Cannot use --bump and --suggest together.');
    }
    if (opts.tag && !opts.bump) {
        throw new ValidationError('--tag requires --bump.');
    }

    // ── Suggest mode ─────────────────────────────────────────────────
    if (opts.suggest) {
        const current = readVersion();
        const client = getGitClient();
        const { grouped, totalCommits } = await client.getCommitsGrouped();

        if (totalCommits === 0) {
            logger.info(`Current version: ${current}`);
            logger.info('No commits found. No bump suggested.');
            return;
        }

        const allCommits = Object.values(grouped).flat();
        const suggestion = suggestBump(allCommits);

        if (suggestion) {
            const next = bumpVersion(current, suggestion);
            logger.raw(`Current:   ${current}`);
            logger.raw(`Suggested: ${suggestion}`);
            logger.raw(`Next:      ${next}`);
        } else {
            logger.raw(`Current: ${current}`);
            logger.raw('No bump suggested (no feat/fix/breaking commits found).');
        }
        return;
    }

    // ── Bump mode ────────────────────────────────────────────────────
    if (opts.bump) {
        if (!VALID_BUMPS.includes(opts.bump)) {
            throw new ValidationError(
                `Invalid bump type "${opts.bump}". Must be major, minor, or patch.`,
            );
        }
        const type = opts.bump as BumpType;
        const current = readVersion();
        const next = bumpVersion(current, type);
        writeVersion(next);
        logger.success(`${current} → ${next}`);

        if (opts.tag) {
            const client = getGitClient();
            await client.createTag(`v${next}`);
            logger.success(`Tagged: v${next}`);
        }

        return;
    }

    // ── Default: print current version ───────────────────────────────
    const current = readVersion();
    logger.raw(current);
}
