// ── Structured logger ────────────────────────────────────────────────
// Single point of control for all CLI output.

export const logger = {
  info(message: string): void {
    console.log(`  ℹ  ${message}`);
  },

  success(message: string): void {
    console.log(`  ✅ ${message}`);
  },

  skip(message: string): void {
    console.log(`  ⏭  ${message}`);
  },

  warn(message: string): void {
    console.warn(`  ⚠️  ${message}`);
  },

  error(message: string): void {
    console.error(`  ✖  ${message}`);
  },

  /** Print raw text without prefix (for Markdown output, etc.) */
  raw(message: string): void {
    console.log(message);
  },

  /** Print a blank line */
  blank(): void {
    console.log();
  },

  /** Print a section header */
  header(title: string): void {
    console.log(`═══ ${title} ═══\n`);
  },
} as const;
