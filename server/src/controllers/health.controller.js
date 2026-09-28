//validates input, HTTP shape responses

import { getHealthStatus } from "../services/health.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getHealth = asyncHandler(async (req,res) => {
    const data = getHealthStatus();
    res.status(data.status === "ok" ? 200 : 503).json({
        success: data.status === "ok",
        data,
    });
});