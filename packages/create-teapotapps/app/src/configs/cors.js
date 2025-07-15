import cors from 'cors';

/**
 * Returns an Express middleware for handling CORS.
 *
 * @param {Array<string>} customOrigins - Additional allowed origins passed manually.
 * @returns {import('express').RequestHandler} CORS middleware for Express.
 *
 * This function merges:
 * - customOrigins (passed when calling the function),
 * - APP_FRONTEND (from .env, exposed via globalThis),
 * - and a default 'http://localhost:3000' for local development.
 *
 * It also enables credentials to allow cookies or auth headers in cross-origin requests.
 */
const corsHandler = (customOrigins = []) => {
    return cors({
        origin: [
            ...customOrigins,
            APP_FRONTEND,
            'http://localhost:3000'
        ],
        credentials: true,
    });
};

export default corsHandler;
