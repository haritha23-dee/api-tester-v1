//server: entry point, connects db first and handles.

import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";

let server;           //as same as fastapi()

async function start(){
    try{
        await connectDB();
        server = app.listen(env.PORT, () => {
            console.log(`Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
        });
    } catch (err){
        console.error("startup failed:", err.message);
        process.exit(1);
    }
}

async function shutdown(signal) {
    console.log(`${signal} received, shutting down...`);
    const forceExit = setTimeout(() => process.exit(1), 10000);
    forceExit.unref();
    try {
        if(server) {
            await new Promise((resolve, reject) => server.close((e) => (e ? reject(e): resolve())));
        }
        await disconnectDB();
        process.exit(0);
    } catch (err) {
        console.error("Shutdown error:", err.message);
        process.exit(1);
    }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
    console.error("Unhandles rejection:", reason);
    shutdown("unhandledRejection");
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught exception:", err);
    shutdown("uncaughtException")
});

start();