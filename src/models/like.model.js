import { Schema, model } from "mongoose";

const likeSchema = new Schema({
    contentType: {
        type: String,
        enum: ["Video", "Comment", "Tweet"],
        required: true,
    },
    content: {
        type: Schema.Types.ObjectId,
        refPath: "contentType",
        required: true
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {timestamps: true});

export const Like = model("Like", likeSchema);