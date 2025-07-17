// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";

/**
 * Middleware to validate the API key from the 'x-api-key' request header.
 * The provided key is compared against the APP_KEY stored in environment variables.
 * If the key is invalid or missing, the request is rejected with a 403 Forbidden response.
 */
const validateApiKey = (req, res, next) => {
    if (req.originalUrl.startsWith("/api")) {
        const apiKey = req.headers["x-api-key"];
        const validApiKey = APP_KEY;
        if (!apiKey || apiKey !== validApiKey) {
            return res.status(403).json({ message: "Forbidden: Invalid API key" });
        }
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

    jwt.verify(token, APP_ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            console.error("JWT Error:", err.message);
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        req.user = decoded;
        next();
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
