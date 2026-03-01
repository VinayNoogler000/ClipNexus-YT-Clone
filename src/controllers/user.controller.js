import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadAssetToCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const registeredUser = asyncHandler(async (req, res, err) => {
    // Extract the textual-data from 'req.body' and files/images from 'req.fles', then store it in proper & semantic variables
    const {userName, email, password, fullName} = req.body;
    const {avatar, coverImage} = req.files ? req.files : {};

    // Validation - Check whether client has sent all the required data to create a new user or not?
    if ([userName, email, password, fullName].some(field => (field?.trim() === ""))) {
        throw new ApiError(400, "Missing Required User Data!");
    }

    // Check if the user already exists or not, by using Username or Email? if exists, then redirect to "/login" or else continue registration process
    const userFound = await User.exists({ $or: [{ userName: userName }, { email: email }] });
    if (userFound !== null) { // User Already Exists
        throw new ApiError(409, "User with Username/Email Already Exists!");
    }

    // Validation and Upload the Avatar and Cover Image (if exists) to the Cloudinary's Server and Get their URL
    if (!avatar) throw new ApiError(400, "User's Avatar doesn't exists [Required]");
    
    const avatarLocalPath =  avatar[0].path;
    const coverImgLocalPath = coverImage ? coverImage[0].path : null;
    
    const uploadedAvatar = await uploadAssetToCloudinary(avatarLocalPath);
    const uploadedCoverImg = coverImgLocalPath && (await uploadAssetToCloudinary(coverImgLocalPath));

    if (!uploadedAvatar) throw new ApiError(500, "Error in Uploading User Avatar to Cloud!");

    // Add the user to the DB "users" collection as an Object/Document, whose avatar and coverImage will be Cloudinary-URLs
    const newUser = await User.create({
        userName: userName.toLowerCase(),
        email,
        password,
        fullName,
        avatar: uploadedAvatar.secure_url,
        coverImage: uploadedCoverImg?.secure_url || ""
    });
    
    // Check if the New User has successfully created/stored in the DB or not? If Yes, then send a response (without password and refresh token), and if No, then identify-fix the issue and repeat the process.
    const savedUser = await User.findById(newUser._id).select(["-password", "-refreshToken"]);
    if (!savedUser) throw new ApiError(500, "Error in Saving New User to DB!");
    
    // Login the User automatically upon User-Registration (after successful addition of new user in DB)
    
    // After automatic log-in, Redirect the User to Homepage

    res.status(201).json(new ApiResponse(200, savedUser, "User Registered Successfully!"));
})

export {registeredUser};