import { Schema, model } from "mongoose";

// Tweets is same as Community-Posts in YouTube

const tweetSchema = new Schema({
    content: {
        type: String,
        trim: true,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {timestamps: true});

export const Tweet = model("Tweet", tweetSchema);