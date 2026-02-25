import { describe, it, expect } from 'vitest';
import { validateVersion, normalizeVersion } from '../src/validation';
import { ValidationError } from '../src/errors';

describe('validateVersion', () => {
    // ── Valid versions ─────────────────────────────────────────────────
    const validCases = [
        '1.0.0',
        '0.1.0',
        '10.20.30',
        'v1.0.0',
        'v0.1.0',
        '1.0.0-beta.1',
        '1.0.0-alpha',
        'v2.0.0-rc.1',
        '1.0.0+build.123',
        '1.0.0-beta.1+build.456',
    ];

    it.each(validCases)('accepts valid version "%s"', (version) => {
        expect(() => validateVersion(version)).not.toThrow();
    });

    // ── Invalid versions ───────────────────────────────────────────────
    const invalidCases = [
        'not-valid',
        '1.0',
        'v',
        'abc',
        '',
        '1.0.0.0',
        'v1',
        '1.0.0-',
        'version1.0.0',
    ];

    it.each(invalidCases)('rejects invalid version "%s"', (version) => {
        expect(() => validateVersion(version)).toThrow(ValidationError);
    });

    it('error message includes the bad version', () => {
        try {
            validateVersion('bad-input');
            expect.fail('should have thrown');
        } catch (err) {
            expect(err).toBeInstanceOf(ValidationError);
            expect((err as ValidationError).message).toContain('bad-input');
            expect((err as ValidationError).exitCode).toBe(2);
        }
    });
});

describe('normalizeVersion', () => {
    it('strips leading v', () => {
        expect(normalizeVersion('v1.0.0')).toBe('1.0.0');
    });

    it('leaves plain version unchanged', () => {
        expect(normalizeVersion('1.0.0')).toBe('1.0.0');
    });

    it('only strips first v', () => {
        expect(normalizeVersion('v1.0.0-v2')).toBe('1.0.0-v2');
    });
});
