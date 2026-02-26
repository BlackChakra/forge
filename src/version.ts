import * as fs from 'fs';
import * as path from 'path';
import { RawCommit } from './types';
import { FileSystemError } from './errors';
import { normalizeVersion } from './validation';

export type BumpType = 'major' | 'minor' | 'patch';

/**
 * Read the current version from package.json in cwd.
 */
export function readVersion(): string {
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    try {
        const raw = fs.readFileSync(pkgPath, 'utf-8');
        const pkg = JSON.parse(raw) as { version?: string };
        if (!pkg.version) {
            throw new FileSystemError('No "version" field found in package.json.');
        }
        return normalizeVersion(pkg.version);
    } catch (err) {
        if (err instanceof FileSystemError) throw err;
        const message = err instanceof Error ? err.message : String(err);
        throw new FileSystemError(`Failed to read package.json: ${message}`);
    }
}

/**
 * Apply a semver bump to the given version string.
 */
export function bumpVersion(current: string, type: BumpType): string {
    const parts = current.split('.').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) {
        throw new Error(`Invalid version format: ${current}`);
    }
    const [major, minor, patch] = parts;
    switch (type) {
        case 'major':
            return `${major + 1}.0.0`;
        case 'minor':
            return `${major}.${minor + 1}.0`;
        case 'patch':
            return `${major}.${minor}.${patch + 1}`;
    }
}

/**
 * Write a new version string into package.json in cwd.
 */
export function writeVersion(newVersion: string): void {
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    try {
        const raw = fs.readFileSync(pkgPath, 'utf-8');
        const pkg = JSON.parse(raw);
        pkg.version = newVersion;
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new FileSystemError(`Failed to write package.json: ${message}`);
    }
}

// ── Breaking change patterns ─────────────────────────────────────────
const BREAKING_RE = /^(\w+)(\([^)]*\))?!:/;
const BREAKING_FOOTER_RE = /BREAKING CHANGE/i;

/**
 * Suggest a bump type based on commit messages.
 * Returns null if no actionable commits are found.
 */
export function suggestBump(commits: readonly RawCommit[]): BumpType | null {
    let hasFeat = false;
    let hasFix = false;

    for (const { message } of commits) {
        if (BREAKING_RE.test(message) || BREAKING_FOOTER_RE.test(message)) {
            return 'major';
        }
        if (/^feat(\(|:)/i.test(message)) hasFeat = true;
        if (/^fix(\(|:)/i.test(message)) hasFix = true;
    }

    if (hasFeat) return 'minor';
    if (hasFix) return 'patch';
    return null;
}
