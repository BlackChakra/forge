# Forge

A simple toolkit for turning commits into structured releases.

Forge is a git-first release engineering CLI that transforms your commit history into clean summaries, changelogs, and pull request descriptions. It operates entirely on git history and produces deterministic, structured Markdown output.

## Why Forge

Maintaining structured release notes and clean PR descriptions takes time. Forge removes that friction by reading your commit history and generating consistent, grouped output based on conventional commit prefixes.

It does not require AI. It does not rewrite your commits. It simply structures what you already wrote.

## Installation

```bash
# Clone and build
git clone https://github.com/your-org/forge.git
cd forge
npm install
npm run build

# Link globally so `forge` is available anywhere
npm link
```

## Usage

### `forge init`

Scaffold project files if they don't already exist.

```bash
forge init            # Creates README.md, CHANGELOG.md, .github/PULL_REQUEST_TEMPLATE.md
forge init --force    # Overwrites existing files
```

### `forge summarize`

Summarize commits since the latest git tag, grouped by category.

```bash
forge summarize
```

Output:

```markdown
## 📋 Commit Summary

> Changes since `v0.1.0` — **12** commits

### Features

- **auth:** add login form (`a1b2c3d`)
- add dark mode toggle (`d4e5f6a`)

### Fixes

- resolve null pointer on logout (`b7c8d9e`)
```

If no tags exist, the last 200 commits are used.

### `forge release`

Generate a changelog entry and PR description for a release.

```bash
# Print to stdout
forge release --ver 1.0.0

# Write to files
forge release --ver 1.0.0 --write
```

With `--write`, two files are created:

| File | Contents |
|------|----------|
| `CHANGELOG.md` | New entry prepended under the header |
| `PR_DESCRIPTION.generated.md` | Structured PR description draft |

## Commit Format

Forge categorizes commits based on [Conventional Commits](https://www.conventionalcommits.org/) prefixes:

| Prefix | Category |
|--------|----------|
| `feat`, `feature`, `perf` | Features |
| `fix`, `bugfix` | Fixes |
| `docs`, `doc` | Docs |
| `refactor` | Refactors |
| `test`, `tests` | Tests |
| `chore`, `ci`, `build`, `style` | Chores |
| *(anything else)* | Other |

Scopes are supported: `feat(auth): add login` appears as **auth:** add login.

## Project Structure

```
src/
├── cli.ts              # Entry point, Commander wiring
├── types.ts            # Shared types and enums
├── git.ts              # Git utilities (simple-git)
├── formatter.ts        # Markdown formatters
└── commands/
    ├── init.ts         # Scaffold project files
    ├── summarize.ts    # Commit summary
    └── release.ts      # Changelog + PR description
```

## License

MIT
