import { getGitClient } from '../git';
import { formatChangelogEntry, formatPRDescription } from '../formatter';
import { ReleaseOptions } from '../types';
import { CHANGELOG_FILENAME, CHANGELOG_HEADER, GENERATED_PR_FILENAME } from '../constants';
import { ValidationError } from '../errors';
import { resolveCwd, writeFileSafe, prependEntry } from '../fs';
import { logger } from '../logger';

// ── Semver validation ────────────────────────────────────────────────
const SEMVER_RE = /^\d+\.\d+\.\d+(?:-[\w.]+)?(?:\+[\w.]+)?$/;

function validateVersion(version: string): void {
    if (!SEMVER_RE.test(version)) {
        throw new ValidationError(
            `Invalid version "${version}". Expected semver format (e.g. 1.0.0, 2.1.0-beta.1).`,
        );
    }
}

// ── Command handler ──────────────────────────────────────────────────

export async function runRelease(options: ReleaseOptions): Promise<void> {
    validateVersion(options.version);

    const client = getGitClient();
    const { grouped, totalCommits } = await client.getCommitsGrouped();

    if (totalCommits === 0) {
        logger.info('No commits found. Nothing to release.');
        return;
    }

    const date = new Date().toISOString().slice(0, 10);
    const changelogEntry = formatChangelogEntry(grouped, options.version, date);
    const prDescription = formatPRDescription(grouped, options.version);

    if (options.write) {
        const changelogPath = resolveCwd(CHANGELOG_FILENAME);
        const prPath = resolveCwd(GENERATED_PR_FILENAME);

        prependEntry(changelogPath, CHANGELOG_HEADER, changelogEntry);
        writeFileSafe(prPath, prDescription);

        logger.blank();
        logger.success(`Release ${options.version} artifacts written:`);
        logger.raw(`   • ${CHANGELOG_FILENAME} (updated)`);
        logger.raw(`   • ${GENERATED_PR_FILENAME} (created)`);
    } else {
        logger.header('CHANGELOG ENTRY');
        logger.raw(changelogEntry);
        logger.header('PR DESCRIPTION');
        logger.raw(prDescription);
    }
}
