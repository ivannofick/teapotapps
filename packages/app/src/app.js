import express from "express";
import cookieParser from "cookie-parser";
import api from "./routes/api.js";
import web from "./routes/web.js";
import corsHandler from "./configs/cors.js";
import './configs/env.js';
import { logger } from "./core/middleware.js";

const app = express();
app.use(corsHandler());
app.disable("x-powered-by");
app.disable("date");

app.use(express.json({ strict: false, limit: '2mb' }));
app.use(cookieParser());
app.use((req, res, next) => {
    res.removeHeader("Date");
    next();
});
app.use(logger);

app.use(api);
app.use(web);

// Global error handler
app.use((err, req, res, next) => {
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
});

export default app;
