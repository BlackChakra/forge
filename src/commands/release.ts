import { getGitClient } from '../git';
import { formatChangelogEntry, formatPRDescription } from '../formatter';
import { ReleaseOptions } from '../types';
import { CHANGELOG_FILENAME, CHANGELOG_HEADER, GENERATED_PR_FILENAME } from '../constants';
import { validateVersion, normalizeVersion } from '../validation';
import { resolveCwd, writeFileSafe, prependEntry } from '../fs';
import { logger } from '../logger';

// ── Command handler ──────────────────────────────────────────────────

export async function runRelease(options: ReleaseOptions): Promise<void> {
  validateVersion(options.version);
  const version = normalizeVersion(options.version);

  const client = getGitClient();
  const { grouped, totalCommits } = await client.getCommitsGrouped();

  if (totalCommits === 0) {
    logger.info('No commits found. Nothing to release.');
    return;
  }

  const date = new Date().toISOString().slice(0, 10);
  const changelogEntry = formatChangelogEntry(grouped, version, date);
  const prDescription = formatPRDescription(grouped, version);

  if (options.write) {
    const changelogPath = resolveCwd(CHANGELOG_FILENAME);
    const prPath = resolveCwd(GENERATED_PR_FILENAME);

    prependEntry(changelogPath, CHANGELOG_HEADER, changelogEntry);
    writeFileSafe(prPath, prDescription);

    logger.blank();
    logger.success(`Release ${version} artifacts written:`);
    logger.raw(`   • ${CHANGELOG_FILENAME} (updated)`);
    logger.raw(`   • ${GENERATED_PR_FILENAME} (created)`);
  } else {
    logger.header('CHANGELOG ENTRY');
    logger.raw(changelogEntry);
    logger.header('PR DESCRIPTION');
    logger.raw(prDescription);
  }
}
