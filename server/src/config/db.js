//depends on mongoose, /.env js files
import mongoose from "mongoose";
import { env } from "./env.js";

mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected"));
mongoose.connection.on("reconnected", () => console.log("MongoDB reconnected"));
mongoose.connection.on("error", (err) => console.error("MongoDB error:", err.message));

export async function connectDB(){
    await mongoose.connect(env.MONGODB_URI, {serverSelectionTimeoutMS: 8000});
    console.log(`MongoDB connected: db="${mongoose.connection.name}"`);
}

export async function disconnectDB(){
    await mongoose.disconnect();
}
