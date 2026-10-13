import express from 'express';
import { logger } from './src/core/middleware.js';

// Core utilities
export { asyncHandler } from './src/core/asyncHandler.js';
export { routeGroup } from './src/core/routeGroup.js';
export { validate, rules } from './src/core/validator.js';
export { render } from './src/core/http.js';
export { logger } from './src/core/middleware.js';

// Libs
export { responseApi } from './src/libs/RestApiHandler.js';
export { signVisitorToken } from './src/libs/JwtHandlers.js';
export { TimeHandler, DEFAULT_TIMEZONE } from './src/libs/TimeHandler.js';
export { paginate, paginateQuery } from './src/libs/pagination.js';

// Middlewares
export {
    validateApiKey,
    verifyTokenVisitor,
    verifyToken
} from './src/middlewares/verifyToken.js';

/**
 * Global default error handling middleware for TeapotApps.
 */
export function defaultErrorHandler(err, req, res, next) {
    console.error("Unhandled Error:", err);
    if (res.headersSent) {
        return next(err);
    }
    const statusCode = err.status || err.statusCode || 500;
    return res.status(statusCode).json({
        data: null,
        meta: null,
        status: {
            code: statusCode,
            message_client: err.message || "Internal server error"
        }
    });
}

/**
 * Creates and pre-configures a base Express app with standard TeapotApps settings.
 * 
 * @param {object} [options]
 * @param {string} [options.jsonLimit='2mb']
 * @param {boolean} [options.enableLogger=true]
 * @returns {import('express').Express}
 */
export function createTeapotApp(options = {}) {
    const app = express();
    app.disable("x-powered-by");
    app.disable("date");
    app.use(express.json({ strict: false, limit: options.jsonLimit || '2mb' }));
    app.use((req, res, next) => {
        res.removeHeader("Date");
        next();
    });
    if (options.enableLogger !== false) {
        app.use(logger);
    }
    return app;
}

export default {
    createTeapotApp,
    defaultErrorHandler
};
