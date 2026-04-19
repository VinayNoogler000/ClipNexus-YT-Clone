import { ApiError, ApiResponse, asyncHandler, uploadAssetToCloudinary, deleteAssetFromCloudinary, genRefreshAndAccessTokens, getImgPublicIdUsingURLSync, deleteTempFiles, attemptFileUpload } from "../utils/index.js"
import { User } from "../models/user.model.js";
import jwt from 'jsonwebtoken'
import mongoose from "mongoose";
import fs from "fs";

const registeredUser = asyncHandler(async (req, res, err) => {
    // Extract the textual-data from 'req.body' and files/images from 'req.fles', then store it in proper & semantic variables
    const {userName, email, password, fullName} = req.body;
    const {avatar, coverImage} = req.files ? req.files : {};
    const avatarLocalPath = avatar ? avatar[0].path : null;
    const coverImgLocalPath = coverImage ? coverImage[0].path : null;

    // Validation - Check whether client has sent all the required data to create a new user or not?
    if ([userName, email, password, fullName].some(field => (!field || field.trim() === ""))) {
        // remove the unnecessary temporary files (avatar & coverImage) from the server's directory
        deleteTempFiles([avatarLocalPath, coverImgLocalPath]);
        throw new ApiError(400, "Missing Required User Data!");
    }

    // Check if the user already exists or not, by using Username or Email? if exists, then redirect to "/login" or else continue registration process
    const userFound = await User.exists({ $or: [{ userName: userName }, { email: email }] });
    if (userFound !== null) { // User Already Exists
        deleteTempFiles([avatarLocalPath, coverImgLocalPath]);
        throw new ApiError(409, "User with Username/Email Already Exists! Either Log-In with the existing account, or Sign-Up with a different new account.");
    }

    // Validation and Upload the Avatar and Cover Image (if exists) to the Cloudinary's Server and Get their URL
    if (!avatar) {
        deleteTempFiles([coverImgLocalPath]);
        throw new ApiError(400, "User's Avatar doesn't exists [Required]");
    }

    const [uploadAvatarRes] = await attemptFileUpload(avatarLocalPath);
    const [uploadCoverImgRes] = await attemptFileUpload(coverImgLocalPath);

    if (!uploadAvatarRes) {
        deleteTempFiles([avatarLocalPath, coverImgLocalPath]);    
        throw new ApiError(500, "Error in Uploading User Avatar to Cloud!");
    }

    // Add the user to the DB "users" collection as an Object/Document, whose avatar and coverImage will be Cloudinary-URLs
    const newUser = await User.create({
        userName: userName.toLowerCase(),
        email,
        password,
        fullName,
        avatar: uploadAvatarRes.secure_url,
        coverImage: uploadCoverImgRes?.secure_url || ""
    });
    
    // Check if the New User has successfully created/stored in the DB or not? If Yes, then send a response (without password and refresh token), and if No, then identify-fix the issue and repeat the process.
    const savedUser = await User.findById(newUser._id).select(["-password", "-refreshToken"]);
    if (!savedUser) throw new ApiError(500, "Error in Saving New User to DB!");
    
    res.status(201).json(new ApiResponse(200, savedUser, "User Registered Successfully!"));
    
    // Login the User automatically upon User-Registration (after successful addition of new user in DB)
    
    // After automatic log-in, Redirect the User to Homepage

})

const loginUser = asyncHandler(async (req, res, err) => {
    // Extract User Data (Username, Email, and Password) sent from the Client, stored in the `req.body`
    const {userName, email, password} = req.body;
    
    // Perform Validation, by checking that the "username or email" does exists and are valid or not
    if (!userName && !email) throw new ApiError(400, "Username or Email is Required!");
    const userNameorEmail = userName || email;

    // Check if the User exists in the DB or not, by using "username or email" [either of these should exists]
    const userInDB = await User.findOne({ $or: [{ userName }, { email }] });

    //If User Not Exists, then send response to the client saying "User doesn't Exists. Kindly Sign-Up or Create a New Account 
    if (!userInDB) throw new ApiError(400, `User '${userNameorEmail}' doesn't Exists!`);

    // If User Exists, then Validate & Match the "password sent in Client-Request" with "password stored in DB"
    if (!password) throw new ApiError(401, "Password is Required!");
    const isPassMatched = await userInDB.isPasswordCorrect(password);

    // If Wrong Password, then send Response to the Client "Wrong Password! Kindly, Enter Correct Password for the [Username/Email]"
    if (!isPassMatched) throw new ApiError(401, `Wrong Password for '${userNameorEmail}'!`);
    
    // If Correct Password, then Generate Access and Refresh Tokens;
    const { accessToken, refreshToken } = await genRefreshAndAccessTokens(userInDB); 
    
    // Store Refresh Token in DB (not Access Token):
    const loggedInUser = await User.findByIdAndUpdate(
        userInDB._id,
        { refreshToken },
        { returnDocument: "after" }
    ).select("-password");
    
    // Send a ApiResponse to the Client, which will be definitely having "Access & Refreh Tokens", for User Authorization, and generating new Access Token by using Refresh Token when the old one expires.
    const options = { // cookie-options
        httpOnly: true,
        secure: true,
    }

    return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    201, 
                    { user: { ...loggedInUser._doc, accessToken} }, 
                    "User Logged-In!"
                )
            );

    // Or Re-direct the user to the webpage (or Resource URL) which they were trying to access, but instead first asked to authenticate them by logging-in.
    
})

const logoutUser = asyncHandler(async (req, res) => {
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { returnDocument: "after" }
    ).select("_id userName");

    const options = { // cookie-options
        httpOnly: true,
        secure: true,
    }

    return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(201, {user: {...updatedUser._doc}}, "User Logged-Out!"));
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const clientRefreshToken = req.cookies?.refreshToken;
        
    if (!clientRefreshToken) throw new ApiError(400, "Unauthorized Request! [RT Required]");

    // verify RT (Refresh Token)
    const decoded = jwt.verify(clientRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    // find the user if exists in the DB, with the "user_id" in RT:
    const userInDB = await User.findById(decoded._id);

    // if User Not Found then throw ApiError
    if (!userInDB) throw new ApiError(400, "Invalid Refresh-Token!");

    // if Both RTs (Client & DB) doesn't Matches then throw ApiError
    if ( clientRefreshToken !== userInDB.refreshToken ) throw new ApiError(400, "Refresh-Token Expired or Used!");
    
    // If Found and RT Matched, then generate a new Tokens, and the send in server's response to client
    const { accessToken, refreshToken } = await genRefreshAndAccessTokens(userInDB);
    
    const options = { // cookie-options
        httpOnly: true,
        secure: true,
    }

    return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(201, {accessToken, refreshToken}, "Access Tokens Refreshed!"));
});

const changeCurrPassword = asyncHandler(async (req, res) => {
    // take current and new password from the user, sent by the client in `req.body` 
    const {oldPass, newPass} = req.body || {};

    // Validate - check if the passwords sent by client or not, else throw Api Error
    if (!oldPass || !newPass) throw new ApiError(400, "Both Old and New Passwords are Required!");

    // Use `req.user._id` to find the User in DB
    const userInDB = await User.findById(req.user._id).select("password");

    // If User not found, then throw Api Error saying "Invalid or Expired Access Token!"
    if (!userInDB) throw new ApiError(401, "Invalid or Expired Access Token!");

    // If User found, check whether the current password matches with the DB Pass or not
    const isPassMatched = await userInDB.isPasswordCorrect(oldPass);
    
    // If Wrong Curr Pass, then throw Api Error saying "Wrong Current Password"
    if (!isPassMatched) throw new ApiError(402, "Wrong Old Password!");

    // If Yes, then update the password field with new password
    userInDB.password = newPass;
    await userInDB.save({ validateBeforeSave: false });

    // send response
    return res
            .status(200)
            .json(new ApiResponse(201, {}, "Password Changed!"));
});

const getCurrUser = asyncHandler(async (req, res) => {
    if (req.user) { // means, user already logged-in
        const userInDB = await User.findById(req.user._id).select("-password -refreshToken");

        return res
                .status(200)
                .json(new ApiResponse(201, {user: userInDB}, "Current User Fetched!"));
    }
    else throw new ApiError(401, "Unauthorized Request - User should be logged-in!");
});

const updateAccDetails = asyncHandler(async (req, res) => {
    const {userName, email, fullName} = req.body || {};

    if (!userName && !email && !fullName) throw new ApiError(401, "Either Username, Email or Full Name is Required!");

    const userInDB = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { userName, email, fullName } },
        { runValidators: true, returnDocument: "after" }
    ).select("userName fullName email");

    if (!userInDB) throw new ApiError(401, "Invalid Access Token!");

    return res
            .status(200)
            .json(new ApiResponse(201, { user: userInDB }, "Account Details Updated!"));
});

const updateImage = asyncHandler(async (req, res) => {
    const imgType = req.params.imageType === "cover-image" ? "coverImage" : "avatar";
    const image = req.files?.[imgType]?.[0];

    // If avatar doesn't exists, then throw error
    if (!image) throw new ApiError(400, `${imgType} is Required!`);
    
    // Upload the New Image to Cloudinary
    const uploadedImg = await uploadAssetToCloudinary(image.path);
    if (!uploadedImg) throw new ApiError(500, `Failed to upload "${imgType}". Might be due to very large file size.`);

    // Find the User and it's Avatar/CoverImg URL stored in DB by using `req.user._id`
    const userInDB = await User.findById(req.user._id).select(imgType);
    if (!userInDB) throw new ApiError(404, "User not found");

    // Store Old Image URL in a variable for using it to delete the avatar from Cloudinary
    const oldImgURL = userInDB[imgType];

    // Update the User's Avatar/CoverImg to New URL, and save in DB
    userInDB[imgType] = uploadedImg.secure_url;
    const updatedUser = await userInDB.save({ validateBeforeSave: false });

    // Send Success Response to the Client, with Images URL in Data
    res.status(200) .json(
        new ApiResponse(201, { [imgType]: updatedUser[imgType] }, `${imgType} Updated Successfully!`));

    if (oldImgURL) {
        // Get it's Public ID
        const public_id = getImgPublicIdUsingURLSync(oldImgURL);
        
        // Delete the Old Images from Cloudinary
        deleteAssetFromCloudinary(public_id);
    }
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username && username.trim() !== "") throw new ApiError(400, "Username is Missing!");
    
    const channel = await User.aggregate([
        { $match: { userName: username?.toLowerCase() } },

        { $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
        }},

        { $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "channelsSubscribedTo"
        }},

        { $addFields: {
            subscribersCount: {
                $size: "$subscribers"
            },
            channelsSubscribedToCount: {
                $size: "$channelsSubscribedTo"
            },
            isSubscribed: {
                $cond: {
                    if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                    then: true,
                    else: false
                }
            }
        } },

        { $project: {
            fullName: 1,
            userName: 1,
            email: 1,
            subscribersCount: 1,
            channelsSubscribedToCount: 1,
            isSubscribed: 1,
            avatar: 1,
            coverImage: 1,
            createdAt: 1
        }}
    ])
    console.log("After Aggregation: ", channel);

    if (!channel?.length ) throw new ApiError (400, "Channel Does Not Exists!");

    return res
        .status(200)
        .json(new ApiResponse(201, { channel: channel[0] }, "User Channel Fetched Successfully!"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {$match: {_id: new mongoose.Types.ObjectId(req.user._id)}},

        {$lookup: {
            from: "videos",
            localField: "watchHistory",
            foreignField: "_id",
            as: "watchHistory",
            pipeline: [ // for Every Watched Video (doc) stored in the "watchHistory" array
                {
                    $lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "owner",
                        as: "owner",
                        pipeline: [
                            {$project: {
                                fullName: 1,
                                userName: 1,
                                avatar: 1
                            }}
                        ]
                    }
                },
                {
                    $addFields: {
                        owner: {
                            $first: "$owner"
                        }
                    }
                }
            ]
        }},
    ])

    return res
        .status(200)
        .json(new ApiResponse(201, { watchHistory: user[0].watchHistory }, "Watched History Fetched Successfully!"));
});

export {registeredUser, loginUser, logoutUser, refreshAccessToken, changeCurrPassword, getCurrUser, updateAccDetails, updateImage, getUserChannelProfile, getWatchHistory};