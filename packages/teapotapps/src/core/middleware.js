/**
 * Simple request logger middleware.
 * Logs method and URL of each incoming request.
 */
export function logger(req, res, next) {
    const now = new Date().toISOString();
    const isDebug = String(globalThis.APP_DEBUG ?? 'true').toLowerCase() === 'true';
    if (isDebug) {
        console.log(`[${now}] ${req.method} ${req.url}`);
    }
    next();
}

