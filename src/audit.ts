import * as fs from 'fs';
import * as path from 'path';

// ── Check result types ───────────────────────────────────────────────

export type CheckStatus = 'OK' | 'WARN' | 'FAIL';

export interface CheckResult {
    readonly status: CheckStatus;
    readonly name: string;
    readonly message: string;
}

// ── Filesystem abstraction (injectable for testing) ──────────────────

export interface FileSystem {
    exists(filePath: string): boolean;
    isDirectory(filePath: string): boolean;
    readFile(filePath: string): string | null;
    listDir(dirPath: string): string[];
}

export const realFs: FileSystem = {
    exists(filePath: string): boolean {
        return fs.existsSync(filePath);
    },
    isDirectory(filePath: string): boolean {
        try {
            return fs.statSync(filePath).isDirectory();
        } catch {
            return false;
        }
    },
    readFile(filePath: string): string | null {
        try {
            return fs.readFileSync(filePath, 'utf-8');
        } catch {
            return null;
        }
    },
    listDir(dirPath: string): string[] {
        try {
            return fs.readdirSync(dirPath);
        } catch {
            return [];
        }
    },
};

// ── Git abstraction (injectable for testing) ─────────────────────────

export interface GitInfo {
    isGitRepo: boolean;
    hasCommits: boolean;
    hasTag: boolean;
}

// ── Individual check functions ───────────────────────────────────────

export function checkGitRepoPresent(git: GitInfo): CheckResult {
    return git.isGitRepo
        ? { status: 'OK', name: 'git_repo_present', message: 'Git repository detected.' }
        : {
            status: 'FAIL',
            name: 'git_repo_present',
            message: 'Not a git repository or git is not installed.',
        };
}

export function checkHasCommits(git: GitInfo): CheckResult {
    if (!git.isGitRepo) {
        return { status: 'FAIL', name: 'has_commits', message: 'Cannot check commits (no git repo).' };
    }
    return git.hasCommits
        ? { status: 'OK', name: 'has_commits', message: 'Repository has commits.' }
        : { status: 'FAIL', name: 'has_commits', message: 'Repository has zero commits.' };
}

export function checkLatestTagPresent(git: GitInfo): CheckResult {
    if (!git.isGitRepo) {
        return {
            status: 'WARN',
            name: 'latest_tag_present',
            message: 'Cannot check tags (no git repo).',
        };
    }
    return git.hasTag
        ? { status: 'OK', name: 'latest_tag_present', message: 'At least one tag exists.' }
        : { status: 'WARN', name: 'latest_tag_present', message: 'No tags found.' };
}

export function checkFilePresent(
    fsys: FileSystem,
    cwd: string,
    relativePath: string,
    checkName: string,
    label: string,
): CheckResult {
    const fullPath = path.resolve(cwd, relativePath);
    return fsys.exists(fullPath)
        ? { status: 'OK', name: checkName, message: `${label} found.` }
        : { status: 'WARN', name: checkName, message: `${label} missing.` };
}

export function checkCiPresent(fsys: FileSystem, cwd: string): CheckResult {
    const workflowDir = path.resolve(cwd, '.github/workflows');
    if (!fsys.isDirectory(workflowDir)) {
        return { status: 'WARN', name: 'ci_present', message: 'No CI workflows found.' };
    }
    const files = fsys.listDir(workflowDir);
    const hasYaml = files.some((f) => f.endsWith('.yml') || f.endsWith('.yaml'));
    return hasYaml
        ? { status: 'OK', name: 'ci_present', message: 'CI workflow found.' }
        : { status: 'WARN', name: 'ci_present', message: 'No CI workflows found.' };
}

export function checkTestsPresent(fsys: FileSystem, cwd: string): CheckResult {
    const testsDir = path.resolve(cwd, 'tests');
    if (!fsys.isDirectory(testsDir)) {
        return { status: 'WARN', name: 'tests_present', message: 'No tests/ directory found.' };
    }
    const files = fsys.listDir(testsDir);
    return files.length > 0
        ? { status: 'OK', name: 'tests_present', message: 'Tests directory has files.' }
        : { status: 'WARN', name: 'tests_present', message: 'Tests directory is empty.' };
}

export function checkPackageJsonValid(fsys: FileSystem, cwd: string): CheckResult {
    const pkgPath = path.resolve(cwd, 'package.json');
    const content = fsys.readFile(pkgPath);

    if (content === null) {
        return { status: 'FAIL', name: 'package_json_valid', message: 'package.json not found.' };
    }

    let pkg: Record<string, unknown>;
    try {
        pkg = JSON.parse(content) as Record<string, unknown>;
    } catch {
        return { status: 'FAIL', name: 'package_json_valid', message: 'package.json is invalid JSON.' };
    }

    const required = ['name', 'version', 'license', 'bin'];
    const missing = required.filter((f) => !(f in pkg));
    if (missing.length > 0) {
        return {
            status: 'WARN',
            name: 'package_json_valid',
            message: `Missing fields: ${missing.join(', ')}.`,
        };
    }

    return { status: 'OK', name: 'package_json_valid', message: 'package.json is valid.' };
}

// ── Run all checks in fixed order ────────────────────────────────────

export function runAllChecks(git: GitInfo, fsys: FileSystem, cwd: string): CheckResult[] {
    return [
        checkGitRepoPresent(git),
        checkHasCommits(git),
        checkLatestTagPresent(git),
        checkFilePresent(fsys, cwd, 'README.md', 'readme_present', 'README.md'),
        checkFilePresent(fsys, cwd, 'CHANGELOG.md', 'changelog_present', 'CHANGELOG.md'),
        checkFilePresent(fsys, cwd, 'LICENSE', 'license_present', 'LICENSE'),
        checkFilePresent(
            fsys,
            cwd,
            '.github/PULL_REQUEST_TEMPLATE.md',
            'pr_template_present',
            'PR template',
        ),
        checkCiPresent(fsys, cwd),
        checkTestsPresent(fsys, cwd),
        checkPackageJsonValid(fsys, cwd),
    ];
}

// ── Exit code logic ──────────────────────────────────────────────────

export function computeExitCode(results: readonly CheckResult[]): number {
    const hasFail = results.some((r) => r.status === 'FAIL');
    const hasWarn = results.some((r) => r.status === 'WARN');
    if (hasFail) return 2;
    if (hasWarn) return 1;
    return 0;
}

// ── Format a single result line ──────────────────────────────────────

export function formatCheckLine(result: CheckResult): string {
    const pad = result.status === 'OK' ? '  ' : '';
    return `${result.status}${pad}  ${result.name}  ${result.message}`;
}
