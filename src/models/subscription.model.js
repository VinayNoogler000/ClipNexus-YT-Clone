import { Schema, model } from "mongoose";

/* The Subscription Model will be storing subscriptions as documents, which will consists of two main properties
"subscriber" and "channel", where both are technically belong to "Users" model, but with different names, as
"subscriber" will be referring to that user who has subscribed to a channel, whose name is stored "channel"
property, means both the properties will be referring to single document (object_id) of the Users model, and
not an array of users. So, whenever we want to find the no. of subscribers of a channel (internally an user),
we just need to find those documents in this model whose "channel" property matches with the name (or _id)
of the channel, and the count of those matched documents will give us the number of subscribers, and to
know the count of channels a user has subscribed to, for that we need to find those docs in this model whose
"subscriber" property matches with the name (or _id) of the user and the count of those docs will be exactly the number of channels the user has subscribed to. A new document is created and added to the "subscriptions" collection whenever any user or channel subscribed to a different user/channel. */

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    channel: { 
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
}, {timestamps: true});

export const Subscription = model("Subscription", subscriptionSchema);