//session schema for refresh token

import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
    {
        user: {type: mongoose.Schema.Types.ObjectId, ref:"User", required:true, index:true},
        tokenHash: { type: String, required: true, unique: true },
        family: { type: String, required: true, index: true},
        expiresAt: { type:Date, required: true },
        revokedAt: {type: Date, default: null},
        userAgent: {type: String, default: "", maxlength: 255},
        ipAddress: {type: String, default: "", maxlength: 64},
    },
    {timestamps: true}
);

//mongodb delete eaxh document automatically once expiresAt has passed
sessionSchema.index({ expiresAt: 1 }, { expiryAfterSeconds: 0});

export const Session = mongoose.model("Session", sessionSchema);        //export session schema