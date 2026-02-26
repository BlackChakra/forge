# 🔥 forge

A tiny, git-first CLI for release engineering. No AI, no magic — just your commit history turned into changelogs, PR descriptions, and release artifacts.

## Install

```bash
git clone https://github.com/BlackChakra/forge.git
cd forge
npm install
npm run build
npm link
```

Now you've got `forge` available everywhere.

## Commands

### `forge init`

Scaffolds starter files so you don't have to.

```bash
forge init            # creates README.md, CHANGELOG.md, PR template
forge init --force    # overwrites existing files
```

### `forge summarize`

Grabs commits since your latest tag (or last 200 if no tags) and prints a clean Markdown summary grouped by type.

```bash
forge summarize
```

### `forge release --ver <version>`

Generates a changelog entry + PR description from your commits.

```bash
forge release --ver 1.0.0           # preview to stdout
forge release --ver 1.0.0 --write   # writes CHANGELOG.md + PR_DESCRIPTION.generated.md
forge release --ver v1.0.0          # "v" prefix is fine, gets stripped
```

### `forge ver`

Read, bump, or get suggestions for your version.

```bash
forge ver                       # prints current version
forge ver --bump patch          # 0.1.0 → 0.1.1
forge ver --bump minor          # 0.1.0 → 0.2.0
forge ver --bump major          # 0.1.0 → 1.0.0
forge ver --bump patch --tag    # bumps + creates annotated git tag
forge ver --suggest             # analyzes commits, suggests bump type
```

### `forge audit`

Quick health check — are you ready to ship?

```bash
forge audit
```

Runs 10 checks and prints a line-by-line report:

| Check | What it looks for |
|-------|-------------------|
| `git_repo_present` | Is this a git repo? |
| `has_commits` | Any commits at all? |
| `latest_tag_present` | At least one semver tag? |
| `readme_present` | README.md exists? |
| `changelog_present` | CHANGELOG.md exists? |
| `license_present` | LICENSE exists? |
| `pr_template_present` | PR template exists? |
| `ci_present` | CI workflow (.yml) exists? |
| `tests_present` | Tests directory with files? |
| `package_json_valid` | Valid package.json with required fields? |

Exit codes: `0` all good, `1` warnings, `2` failures.

## Commit Format

Forge understands [conventional commits](https://www.conventionalcommits.org/):

```
feat(auth): add login flow       → Features
fix: null pointer crash          → Fixes
docs: update API guide           → Docs
refactor: extract helper         → Refactors
test: add parser tests           → Tests
chore: bump deps                 → Chores
anything else                    → Other
```

Scopes are optional. Prefix `!` or `BREAKING CHANGE` triggers a major bump suggestion.

## Development

```bash
npm run build         # compile TypeScript
npm run test          # run 115 tests (vitest)
npm run test:watch    # watch mode
npm run lint          # eslint
npm run format        # prettier
```

## License

MIT
