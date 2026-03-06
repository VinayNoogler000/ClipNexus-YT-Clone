import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadAssetToCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
const genRefreshAndAccessTokens = (userInDB) => (
    { accessToken: userInDB.generateAccessToken(), refreshToken: userInDB.generateRefreshToken() }
);

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
        throw new ApiError(409, "User with Username/Email Already Exists! Either Log-In with the existing account, or Sign-Up with a different new account.");
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
    const { accessToken, refreshToken } = genRefreshAndAccessTokens(userInDB); 
    
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
                    { user: { ...loggedInUser._doc, accessToken: tokens.accessToken} }, 
                    "User Logged-In!"
                )
            );

    // Or Re-direct the user to the webpage (or Resource URL) which they were trying to access, but instead first asked to authenticate them by logging-in.
    
})

const logoutUser = asyncHandler(async (req, res) => {
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: "" } },
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

export {registeredUser, loginUser, logoutUser};