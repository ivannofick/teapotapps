import http from "http";
import './src/configs/env.js';
import app from "./src/app.js";

const httpServer = http.createServer(app);

httpServer.listen(APP_PORT, APP_HOST, function () {
    console.log(`Started application on http://localhost:${APP_PORT} — take care of your health :)`);
});