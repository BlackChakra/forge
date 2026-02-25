import * as fs from 'fs';
import * as path from 'path';
import { getCommitsGrouped } from '../git';
import { formatChangelogEntry, formatPRDescription } from '../formatter';
import { ReleaseOptions } from '../types';

// ── Command handler ──────────────────────────────────────────────────

export async function runRelease(options: ReleaseOptions): Promise<void> {
    const { grouped, totalCommits } = await getCommitsGrouped();

    if (totalCommits === 0) {
        console.log('No commits found. Nothing to release.');
        return;
    }

    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const changelogEntry = formatChangelogEntry(grouped, options.version, date);
    const prDescription = formatPRDescription(grouped, options.version);

    if (options.write) {
        writeChangelog(changelogEntry);
        writePRDescription(prDescription);
        console.log(`\n✅ Release ${options.version} artifacts written:`);
        console.log('   • CHANGELOG.md (updated)');
        console.log('   • PR_DESCRIPTION.generated.md (created)');
    } else {
        console.log('═══ CHANGELOG ENTRY ═══\n');
        console.log(changelogEntry);
        console.log('═══ PR DESCRIPTION ═══\n');
        console.log(prDescription);
    }
}

// ── File writers ─────────────────────────────────────────────────────

function writeChangelog(entry: string): void {
    const cwd = process.cwd();
    const filePath = path.resolve(cwd, 'CHANGELOG.md');

    if (fs.existsSync(filePath)) {
        const existing = fs.readFileSync(filePath, 'utf-8');
        // Insert the new entry after the first heading line (# Changelog ...)
        const headerEnd = existing.indexOf('\n');
        if (headerEnd !== -1) {
            const header = existing.slice(0, headerEnd + 1);
            const rest = existing.slice(headerEnd + 1);
            fs.writeFileSync(filePath, `${header}\n${entry}\n${rest}`, 'utf-8');
        } else {
            fs.writeFileSync(filePath, `${existing}\n\n${entry}`, 'utf-8');
        }
    } else {
        fs.writeFileSync(filePath, `# Changelog\n\n${entry}`, 'utf-8');
    }
}

function writePRDescription(content: string): void {
    const cwd = process.cwd();
    const filePath = path.resolve(cwd, 'PR_DESCRIPTION.generated.md');
    fs.writeFileSync(filePath, content, 'utf-8');
}
