import { ValidationError } from './errors';

// ── Semver validation ────────────────────────────────────────────────
// Allows optional leading "v", e.g. v1.0.0 or 1.0.0-beta.1+build.123
const SEMVER_RE = /^v?\d+\.\d+\.\d+(?:-[\w.]+)?(?:\+[\w.]+)?$/;

/**
 * Validate that a version string matches semver format.
 * Throws ValidationError if invalid.
 */
export function validateVersion(version: string): void {
    if (!SEMVER_RE.test(version)) {
        throw new ValidationError(
            `Invalid version "${version}". Expected semver format (e.g. 1.0.0, v2.1.0-beta.1).`,
        );
    }
}

/**
 * Normalize a version string by stripping an optional leading "v".
 */
export function normalizeVersion(version: string): string {
    return version.startsWith('v') ? version.slice(1) : version;
}
