import * as fs from 'fs';
import * as path from 'path';
import { FileSystemError } from './errors';

/**
 * Write content to a file, creating parent directories as needed.
 */
export function writeFileSafe(filePath: string, content: string): void {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf-8');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new FileSystemError(`Failed to write ${filePath}: ${message}`);
  }
}

/**
 * Read file contents, or return null if it doesn't exist.
 */
export function readFileOrNull(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Check whether a file exists.
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Resolve a relative path against the current working directory.
 */
export function resolveCwd(relativePath: string): string {
  return path.resolve(process.cwd(), relativePath);
}

/**
 * Prepend a new entry into a file after its first-line header.
 * If the file doesn't exist, creates it with the given header.
 */
export function prependEntry(filePath: string, header: string, entry: string): void {
  const existing = readFileOrNull(filePath);

  if (existing) {
    const headerEnd = existing.indexOf('\n');
    if (headerEnd !== -1) {
      const fileHeader = existing.slice(0, headerEnd + 1);
      const rest = existing.slice(headerEnd + 1);
      writeFileSafe(filePath, `${fileHeader}\n${entry}\n${rest}`);
    } else {
      writeFileSafe(filePath, `${existing}\n\n${entry}`);
    }
  } else {
    writeFileSafe(filePath, `${header}\n\n${entry}`);
  }
}
