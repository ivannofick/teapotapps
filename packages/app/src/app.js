import express from "express";
import cookieParser from "cookie-parser";
import api from "./routes/api.js";
import web from "./routes/web.js";
import corsHandler from "./configs/cors.js";
import './configs/env.js';
import { logger, defaultErrorHandler } from "teapotapps";

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
app.use(defaultErrorHandler);

export default app;
