import http from "http";
import app from "./src/app.js";

const port = globalThis.APP_PORT || 3010;
const host = globalThis.APP_HOST || "0.0.0.0";

const httpServer = http.createServer(app);

httpServer.listen(port, host, function () {
    console.log(`Started application on http://localhost:${port} — take care of your health :)`);
});