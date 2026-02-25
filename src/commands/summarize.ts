import { getCommitsGrouped } from '../git';
import { formatSummaryMarkdown } from '../formatter';

// ── Command handler ──────────────────────────────────────────────────

export async function runSummarize(): Promise<void> {
    const { grouped, tag, totalCommits } = await getCommitsGrouped();

    if (totalCommits === 0) {
        console.log('No commits found.');
        return;
    }

    const markdown = formatSummaryMarkdown(grouped, tag, totalCommits);
    console.log(markdown);
}
