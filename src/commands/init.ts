import * as fs from 'fs';
import * as path from 'path';
import { InitOptions } from '../types';

// ── Template content ─────────────────────────────────────────────────

const README_CONTENT = `# Project

> Initialized by [forge-cli](https://github.com/forge-cli)

## Getting Started

\`\`\`bash
npm install
npm run build
\`\`\`

## License

MIT
`;

const CHANGELOG_CONTENT = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
`;

const PR_TEMPLATE_CONTENT = `## Summary

<!-- Describe the changes in this PR -->

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Refactor
- [ ] Other

## Checklist

- [ ] Tests pass
- [ ] Documentation updated
- [ ] Changelog updated
`;

// ── Scaffold files ───────────────────────────────────────────────────

interface ScaffoldFile {
    relativePath: string;
    content: string;
}

const SCAFFOLD_FILES: ScaffoldFile[] = [
    { relativePath: 'README.md', content: README_CONTENT },
    { relativePath: 'CHANGELOG.md', content: CHANGELOG_CONTENT },
    { relativePath: '.github/PULL_REQUEST_TEMPLATE.md', content: PR_TEMPLATE_CONTENT },
];

// ── Command handler ──────────────────────────────────────────────────

export async function runInit(options: InitOptions): Promise<void> {
    const cwd = process.cwd();

    for (const file of SCAFFOLD_FILES) {
        const fullPath = path.resolve(cwd, file.relativePath);
        const dir = path.dirname(fullPath);

        // Ensure parent directory exists
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        if (fs.existsSync(fullPath) && !options.force) {
            console.log(`  ⏭  Skipped (exists): ${file.relativePath}`);
            continue;
        }

        fs.writeFileSync(fullPath, file.content, 'utf-8');
        const verb = options.force && fs.existsSync(fullPath) ? 'Overwrote' : 'Created';
        console.log(`  ✅ ${verb}: ${file.relativePath}`);
    }

    console.log('\nDone! Project scaffold is ready.');
}
