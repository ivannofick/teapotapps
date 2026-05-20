/**
 * Simple request logger middleware.
 * Logs method and URL of each incoming request.
 */
export function logger(req, res, next) {
    const now = new Date().toISOString();
    if (APP_DEBUG != "false" || APP_DEBUG != false) {
        console.log(`[${now}] ${req.method} ${req.url}`);
    }
    next();
}

