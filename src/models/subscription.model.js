import { Schema, model } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: { // other users who've subscribed to the main user
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    channel: { // other users/channels who the main user has subscribed to
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
}, {timestamps: true});

export const Subscription = model("Subscription", subscriptionSchema);