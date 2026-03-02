import {Schema, model} from "mongoose";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'

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

userSchema.pre("save", async function() {
    if (this.isModified("password")) {
        try {
            this.password = await bcrypt.hash(this.password, 10);
        }
        catch(err) {
            console.error("Error in Encrypting & Saving Password in DB: \n", err);
        }
    }
})

userSchema.methods.isPasswordCorrect = async function(password) {
    try {
        return await brcypt.compare(password, this.password);
    }
    catch(err) {
        console.error("Error in Comparing User-Entered-Pass with Encrypted Password: \n", err);
    }
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName,
            fullName: this.fullName
        }, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
}

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET, 
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
}

export const User = model("User", userSchema);