//DB Constraints and schemas setup

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {type: String, required:true, trim: true, minlength:3, maxlength: 50},
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 254,
        },
        passwordHash: {type: String, required: true, select: false},
    },
    {timestamps: true}
);

export const User = mongoose.model("User", userSchema);   //export User schema for es module