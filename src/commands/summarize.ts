import { getGitClient } from '../git';
import { formatSummaryMarkdown } from '../formatter';
import { logger } from '../logger';

// ── Command handler ──────────────────────────────────────────────────

export async function runSummarize(): Promise<void> {
  const client = getGitClient();
  const { grouped, tag, totalCommits } = await client.getCommitsGrouped();

  if (totalCommits === 0) {
    logger.info('No commits found.');
    return;
  }

  const markdown = formatSummaryMarkdown(grouped, tag, totalCommits);
  logger.raw(markdown);
}
