import {Schema, Model} from "mongoose";
import brcypt from "bcrypt";

const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, // Cloudinary URL
        required: true,
    },
    coverImage: {
        type: String, // Cloudinary URL
    },
    watchHistory: [{
        type: Schema.Types.ObjectId,
        ref: "Video"
    }],
    password: {
        type: String,
        required: [true, "Password is required!"],
    },
    refreshToken: {
        type: String,
    }
}, {timestamps: true});

userSchema.pre("save", async function(next) {
    if (this.isModified("password")) {
        try {
            this.password = await brcypt.hash(this.password, 10);
        }
        catch(err) {
            console.error("Error in Encrypting & Saving Password in DB: \n", err);
        }
    }
    next();
})

userSchema.methods.isPasswordCorrect = async function(password) {
    try {
        return await brcypt.compare(password, this.password);
    }
    catch(err) {
        console.error("Error in Comparing User-Entered-Pass with Encrypted Password: \n", err);
    }
}

export const User = Model("User", userSchema);