import { describe, it, expect } from 'vitest';
import {
    checkGitRepoPresent,
    checkHasCommits,
    checkLatestTagPresent,
    checkFilePresent,
    checkCiPresent,
    checkTestsPresent,
    checkPackageJsonValid,
    runAllChecks,
    computeExitCode,
    formatCheckLine,
    FileSystem,
    GitInfo,
    CheckResult,
} from '../src/audit';

// ── Mock filesystem ──────────────────────────────────────────────────

function mockFs(files: Record<string, string | null>, dirs: string[] = []): FileSystem {
    return {
        exists(filePath: string): boolean {
            return filePath in files || dirs.some((d) => filePath.endsWith(d));
        },
        isDirectory(filePath: string): boolean {
            return dirs.some((d) => filePath.endsWith(d));
        },
        readFile(filePath: string): string | null {
            return files[filePath] ?? null;
        },
        listDir(dirPath: string): string[] {
            const prefix = dirPath + '/';
            return Object.keys(files)
                .filter((f) => f.startsWith(prefix))
                .map((f) => f.slice(prefix.length))
                .filter((f) => !f.includes('/'));
        },
    };
}

// ── Git info helpers ─────────────────────────────────────────────────

const gitOk: GitInfo = { isGitRepo: true, hasCommits: true, hasTag: true };
const gitNoRepo: GitInfo = { isGitRepo: false, hasCommits: false, hasTag: false };
const gitNoCommits: GitInfo = { isGitRepo: true, hasCommits: false, hasTag: false };
const gitNoTag: GitInfo = { isGitRepo: true, hasCommits: true, hasTag: false };

// ── checkGitRepoPresent ──────────────────────────────────────────────

describe('checkGitRepoPresent', () => {
    it('OK when git repo exists', () => {
        expect(checkGitRepoPresent(gitOk).status).toBe('OK');
    });

    it('FAIL when no git repo', () => {
        expect(checkGitRepoPresent(gitNoRepo).status).toBe('FAIL');
    });
});

// ── checkHasCommits ──────────────────────────────────────────────────

describe('checkHasCommits', () => {
    it('OK when commits exist', () => {
        expect(checkHasCommits(gitOk).status).toBe('OK');
    });

    it('FAIL when no commits', () => {
        expect(checkHasCommits(gitNoCommits).status).toBe('FAIL');
    });

    it('FAIL when no git repo', () => {
        expect(checkHasCommits(gitNoRepo).status).toBe('FAIL');
    });
});

// ── checkLatestTagPresent ────────────────────────────────────────────

describe('checkLatestTagPresent', () => {
    it('OK when tag exists', () => {
        expect(checkLatestTagPresent(gitOk).status).toBe('OK');
    });

    it('WARN when no tag', () => {
        expect(checkLatestTagPresent(gitNoTag).status).toBe('WARN');
    });

    it('WARN when no git repo', () => {
        expect(checkLatestTagPresent(gitNoRepo).status).toBe('WARN');
    });
});

// ── checkFilePresent ─────────────────────────────────────────────────

describe('checkFilePresent', () => {
    it('OK when file exists', () => {
        const fsys = mockFs({ '/project/README.md': '# Hi' });
        expect(checkFilePresent(fsys, '/project', 'README.md', 'readme_present', 'README.md').status).toBe('OK');
    });

    it('WARN when file missing', () => {
        const fsys = mockFs({});
        expect(checkFilePresent(fsys, '/project', 'README.md', 'readme_present', 'README.md').status).toBe('WARN');
    });
});

// ── checkCiPresent ───────────────────────────────────────────────────

describe('checkCiPresent', () => {
    it('OK when yaml files exist', () => {
        const fsys = mockFs(
            { '/project/.github/workflows/ci.yml': 'on: push' },
            ['.github/workflows'],
        );
        expect(checkCiPresent(fsys, '/project').status).toBe('OK');
    });

    it('WARN when no workflows dir', () => {
        const fsys = mockFs({});
        expect(checkCiPresent(fsys, '/project').status).toBe('WARN');
    });

    it('WARN when workflows dir empty', () => {
        const fsys = mockFs({}, ['.github/workflows']);
        expect(checkCiPresent(fsys, '/project').status).toBe('WARN');
    });
});

// ── checkTestsPresent ────────────────────────────────────────────────

describe('checkTestsPresent', () => {
    it('OK when tests dir has files', () => {
        const fsys = mockFs({ '/project/tests/foo.test.ts': '' }, ['tests']);
        expect(checkTestsPresent(fsys, '/project').status).toBe('OK');
    });

    it('WARN when tests dir missing', () => {
        const fsys = mockFs({});
        expect(checkTestsPresent(fsys, '/project').status).toBe('WARN');
    });

    it('WARN when tests dir empty', () => {
        const fsys = mockFs({}, ['tests']);
        expect(checkTestsPresent(fsys, '/project').status).toBe('WARN');
    });
});

// ── checkPackageJsonValid ────────────────────────────────────────────

describe('checkPackageJsonValid', () => {
    it('OK when all required fields present', () => {
        const pkg = JSON.stringify({ name: 'x', version: '1.0.0', license: 'MIT', bin: {} });
        const fsys = mockFs({ '/project/package.json': pkg });
        expect(checkPackageJsonValid(fsys, '/project').status).toBe('OK');
    });

    it('FAIL when file missing', () => {
        const fsys = mockFs({});
        expect(checkPackageJsonValid(fsys, '/project').status).toBe('FAIL');
    });

    it('FAIL when invalid JSON', () => {
        const fsys = mockFs({ '/project/package.json': '{broken' });
        expect(checkPackageJsonValid(fsys, '/project').status).toBe('FAIL');
    });

    it('WARN when fields missing', () => {
        const pkg = JSON.stringify({ name: 'x' });
        const fsys = mockFs({ '/project/package.json': pkg });
        const result = checkPackageJsonValid(fsys, '/project');
        expect(result.status).toBe('WARN');
        expect(result.message).toContain('version');
        expect(result.message).toContain('license');
        expect(result.message).toContain('bin');
    });
});

// ── runAllChecks order ───────────────────────────────────────────────

describe('runAllChecks', () => {
    it('returns exactly 10 checks in fixed order', () => {
        const fsys = mockFs({});
        const results = runAllChecks(gitOk, fsys, '/project');
        expect(results).toHaveLength(10);
        expect(results.map((r) => r.name)).toEqual([
            'git_repo_present',
            'has_commits',
            'latest_tag_present',
            'readme_present',
            'changelog_present',
            'license_present',
            'pr_template_present',
            'ci_present',
            'tests_present',
            'package_json_valid',
        ]);
    });
});

// ── computeExitCode ──────────────────────────────────────────────────

describe('computeExitCode', () => {
    const ok: CheckResult = { status: 'OK', name: 'x', message: '' };
    const warn: CheckResult = { status: 'WARN', name: 'x', message: '' };
    const fail: CheckResult = { status: 'FAIL', name: 'x', message: '' };

    it('returns 0 when all OK', () => {
        expect(computeExitCode([ok, ok, ok])).toBe(0);
    });

    it('returns 1 when WARN only', () => {
        expect(computeExitCode([ok, warn, ok])).toBe(1);
    });

    it('returns 2 when any FAIL', () => {
        expect(computeExitCode([ok, warn, fail])).toBe(2);
    });

    it('returns 2 when FAIL without WARN', () => {
        expect(computeExitCode([ok, fail])).toBe(2);
    });

    it('returns 0 for empty results', () => {
        expect(computeExitCode([])).toBe(0);
    });
});

// ── formatCheckLine ──────────────────────────────────────────────────

describe('formatCheckLine', () => {
    it('formats OK with padding', () => {
        const line = formatCheckLine({ status: 'OK', name: 'test_check', message: 'All good.' });
        expect(line).toBe('OK    test_check  All good.');
    });

    it('formats WARN without extra padding', () => {
        const line = formatCheckLine({ status: 'WARN', name: 'test_check', message: 'Missing.' });
        expect(line).toBe('WARN  test_check  Missing.');
    });

    it('formats FAIL without extra padding', () => {
        const line = formatCheckLine({ status: 'FAIL', name: 'test_check', message: 'Broken.' });
        expect(line).toBe('FAIL  test_check  Broken.');
    });
});
