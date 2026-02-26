#!/usr/bin/env node

import { Command } from 'commander';
import { runInit } from './commands/init';
import { runSummarize } from './commands/summarize';
import { runRelease } from './commands/release';
import { runVersion } from './commands/version';
import { ForgeError } from './errors';
import { logger } from './logger';

// ── Program ──────────────────────────────────────────────────────────

const program = new Command();

program.name('forge').description('A git-first release engineering toolkit').version('0.1.0');

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

// ── forge version ────────────────────────────────────────────────────
program
  .command('ver')
  .description('Show or bump the project version')
  .option('--bump <type>', 'Bump version: major, minor, or patch')
  .option('--tag', 'Create an annotated git tag after bumping', false)
  .option('--suggest', 'Suggest a bump type based on commits', false)
  .action(async (opts) => {
    await runVersion({ bump: opts.bump, tag: opts.tag, suggest: opts.suggest });
  });

// ── Error boundary ───────────────────────────────────────────────────

async function main(): Promise<void> {
  try {
    await program.parseAsync();
  } catch (err) {
    if (err instanceof ForgeError) {
      logger.error(err.message);
      process.exitCode = err.exitCode;
    } else {
      logger.error(err instanceof Error ? err.message : String(err));
      process.exitCode = 1;
    }
  }
}

main();
