import {Schema, model} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true
    }
}, {timestamps: true})

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = model("Comment", commentSchema);