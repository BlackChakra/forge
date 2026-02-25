import { ScaffoldFile } from '../types';

export const README_TEMPLATE = `# Project

> Initialized by [forge-cli](https://github.com/forge-cli)

## Getting Started

\`\`\`bash
npm install
npm run build
\`\`\`

## License

MIT
`;

export const CHANGELOG_TEMPLATE = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
`;

export const PR_TEMPLATE = `## Summary

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

export const SCAFFOLD_FILES: readonly ScaffoldFile[] = [
  { relativePath: 'README.md', content: README_TEMPLATE },
  { relativePath: 'CHANGELOG.md', content: CHANGELOG_TEMPLATE },
  { relativePath: '.github/PULL_REQUEST_TEMPLATE.md', content: PR_TEMPLATE },
] as const;
