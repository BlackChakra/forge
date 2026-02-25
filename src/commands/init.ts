import { InitOptions } from '../types';
import { SCAFFOLD_FILES } from '../templates';
import { writeFileSafe, fileExists, resolveCwd } from '../fs';
import { logger } from '../logger';

// ── Command handler ──────────────────────────────────────────────────

export async function runInit(options: InitOptions): Promise<void> {
    for (const file of SCAFFOLD_FILES) {
        const fullPath = resolveCwd(file.relativePath);
        const exists = fileExists(fullPath);

        if (exists && !options.force) {
            logger.skip(`Skipped (exists): ${file.relativePath}`);
            continue;
        }

        writeFileSafe(fullPath, file.content);

        const verb = exists ? 'Overwrote' : 'Created';
        logger.success(`${verb}: ${file.relativePath}`);
    }

    logger.blank();
    logger.raw('Done! Project scaffold is ready.');
}
