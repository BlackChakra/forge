// ── Base error ───────────────────────────────────────────────────────

export class ForgeError extends Error {
    readonly exitCode: number;

    constructor(message: string, exitCode: number = 1) {
        super(message);
        this.name = 'ForgeError';
        this.exitCode = exitCode;
    }
}

// ── Subtypes ─────────────────────────────────────────────────────────

export class GitError extends ForgeError {
    constructor(message: string) {
        super(message, 1);
        this.name = 'GitError';
    }
}

export class ValidationError extends ForgeError {
    constructor(message: string) {
        super(message, 2);
        this.name = 'ValidationError';
    }
}

export class FileSystemError extends ForgeError {
    constructor(message: string) {
        super(message, 3);
        this.name = 'FileSystemError';
    }
}
