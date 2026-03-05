import { jwt } from "jsonwebtoken";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { User } from "../models/user.model";

export default verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorizaton")?.replace("Bearer ", "");
    
        if (!token) throw new ApiError(401, "Unauthorized Request!");
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const userInDB = await User.findById(decodedToken?._id).select("_id");
    
        if (!userInDB) throw new ApiError(401, "Invalid Access Token!");
    
        req.user = userInDB;
        next();
    } 
    catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token!");
    }
});