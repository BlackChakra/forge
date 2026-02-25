#!/usr/bin/env node

import { Command } from 'commander';
import { runInit } from './commands/init';
import { runSummarize } from './commands/summarize';
import { runRelease } from './commands/release';

const program = new Command();

program
    .name('forge')
    .description('A git-first release engineering toolkit')
    .version('0.1.0');

// ── forge init ───────────────────────────────────────────────────────
program
    .command('init')
    .description('Scaffold project files (README, CHANGELOG, PR template)')
    .option('-f, --force', 'Overwrite existing files', false)
    .action(async (opts) => {
        await runInit({ force: opts.force });
    });

// ── forge summarize ──────────────────────────────────────────────────
program
    .command('summarize')
    .description('Summarize commits since the latest tag')
    .action(async () => {
        await runSummarize();
    });

// ── forge release ────────────────────────────────────────────────────
program
    .command('release')
    .description('Generate changelog entry and PR description')
    .requiredOption('--ver <version>', 'Release version (e.g. 1.0.0)')
    .option('-w, --write', 'Write to CHANGELOG.md and PR_DESCRIPTION.generated.md', false)
    .action(async (opts) => {
        await runRelease({ version: opts.ver, write: opts.write });
    });

program.parse();
