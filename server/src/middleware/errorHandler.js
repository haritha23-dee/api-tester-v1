//middleware error: payloads, duplicates, payload too large

import mongoose from "mongoose";
import { ZodError, z } from "zod";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`, "NOT_FOUND"));
};

//express recognises error middleware only by 4 arguments
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  let statusCode = 500;
  let code = "INTERNAL_ERROR";
  let message = "Internal server error";
  let details;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = "Invalid request data";
    details = z.flattenError(err).fieldErrors;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = "Invalid data";
    details = Object.fromEntries(
      Object.entries(err.errors).map(([field, e]) => [field, e.message])
    );
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    code = "INVALID_ID";
    message = `Invalid value for '${err.path}'`;
  } else if (err?.code === 11000) {
    statusCode = 409;
    code = "DUPLICATE_KEY";
    message = "Resource already exists";
  } else if (err?.type === "entity.parse.failed") {
    statusCode = 400;
    code = "INVALID_JSON";
    message = "Malformed JSON body";
  } else if (err?.type === "entity.too.large") {
    statusCode = 413;
    code = "PAYLOAD_TOO_LARGE";
    message = "Request body too large";
  }

  if (env.NODE_ENV === "development") {
    console.error(err.stack || err);
  } else if (statusCode >= 500) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${err.name}: ${err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    error: { code, message, ...(details && { details }) },
  });
};