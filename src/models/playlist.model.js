import { Schema, model } from "mongoose";

const playlistSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    videos: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video",
        }
    ],
    status: {
        type: String,
        enum: ["public", "private"],
        required: true
    }
}, {timestamps: true});

export const Playlist = model("Playlist", playlistSchema);