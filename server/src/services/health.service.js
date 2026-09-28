//api health handling: service, controller, route

import mongoose from "mongoose";

const DB_STATES = {0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting"};

export function getHealthStatus() {
    const database = DB_STATES[mongoose.connection.readyState] ?? "unknown";
    return {
        status: database === "connected" ? "ok" : "degraded",
        database,
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
    }
}