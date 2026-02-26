import asyncHandler from "../utils/asyncHandler.js";

const registeredUser = asyncHandler(async (req, res, err) => {
    res.status(200).json({
        message: "User Successfully Registered!"
    })
})

export {registeredUser};