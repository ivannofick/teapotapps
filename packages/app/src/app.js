import express from "express";
import cookieParser from "cookie-parser";
import api from "./routes/api.js";
import corsHandler from "./configs/cors.js";
import './configs/env.js';

const app = express();
app.use(corsHandler());
app.disable("x-powered-by");
app.disable("date");

app.use(express.json({ strict: false }));
app.use(cookieParser());
app.use((req, res, next) => {
    res.removeHeader("Date");
    next();
});
app.use(api);

export default app;
