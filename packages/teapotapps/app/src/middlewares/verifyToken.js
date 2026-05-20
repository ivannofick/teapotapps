// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";

/**
 * Middleware to validate the API key from the 'Access-key' or 'x-api-key' request header.
 * The provided key is compared against the APP_KEY stored in environment variables.
 * If the key is invalid or missing, the request is rejected with a 403 Forbidden response.
 */
export const validateApiKey = (req, res, next) => {
    if (req.originalUrl.startsWith("/api")) {
        // Allow public GET access to files (for redirection)
        if (req.method === "GET" && req.originalUrl.includes("/api/files/")) {
            return next();
        }

        const apiKey = req.headers["access-key"] || req.headers["x-api-key"];
        const validApiKey = APP_KEY;
        if (!apiKey || apiKey !== validApiKey) {
            return res.status(403).json({ message: "Forbidden: Invalid API key" });
        }
    }
    next();
};

/**
 * Middleware for validating the presence of a visitor authorization token.
 */
export const verifyTokenVisitor = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(401).json({ message: "Forbidden: Access denied" });
    }
    next();
};

/**
 * Middleware to validate the JWT (JSON Web Token) from the 'Authorization' header.
 * The token must be in the format 'Bearer <token>'. If the token is missing or invalid,
 * the request is rejected with a 401 or 403 response.
 * On successful verification, the decoded token payload is attached to req.user.
 */
const validateToken = (req, res, next) => {
    res.removeHeader("Date"); // Optionally remove the Date header for privacy or security reasons

    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Forbidden: Access denied" });
    }

    jwt.verify(token, APP_ACCESS_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
            console.error("JWT Error:", err.message);
            return res.status(403).json({ message: "Invalid or expired token" });
        }

        try {
            // Check user in database if model is available
            let user = null;
            try {
                const { default: UsersModels } = await import("../models/UsersModels.js");
                user = await UsersModels.findOne({
                    where: { id: decoded.swu, status: 1 }
                });
            } catch (importErr) {
                // If UsersModels does not exist or fails to load, fallback to decoded info to prevent crashes
                user = { id: decoded.swu };
            }

            if (!user) {
                return res.status(401).json({ 
                    status: { code: 401, message: "User not found or inactive", type: "fail" },
                    data: null 
                });
            }

            req.user = decoded;
            next();
        } catch (dbError) {
            console.error("Database Auth Error:", dbError);
            return res.status(500).json({ message: "Internal authentication error" });
        }
    });
};

/**
 * Main middleware that sequentially validates both the API key and the JWT token.
 * If both validations succeed, the request is allowed to proceed to the next handler.
 * This ensures that only authorized and authenticated requests are processed.
 */
export const verifyToken = (req, res, next) => {
    validateApiKey(req, res, () => {
        validateToken(req, res, next);
    });
};

/**
 * Middleware to check if the user has one of the allowed roles.
 * Must be used after verifyToken middleware.
 */
export const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        const role = Number(req.user.rco);
        if (!allowedRoles.includes(role)) {
            return res.status(403).json({ 
                status: { code: 403, message: "Forbidden: Insufficient permissions", type: "fail" },
                data: null 
            });
        }
        next();
    };
};
