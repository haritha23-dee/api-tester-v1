//collection model for the 'users' in db with manual foreign key
//refrence to the user's table

import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
    {
        owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true, trim: true, minlength:1, maxlength: 100},
        description: {type: String, default: "", trim: true, maxlength: 500},
    },
    { timestamps: true }
);

collectionSchema.index(
    { owner: 1, collation: {locale:"en", strength: 2} }
);

export const Collection = mongoose.model("Collection", collectionSchema);