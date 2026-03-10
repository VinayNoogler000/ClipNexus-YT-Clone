import { Router } from "express";
import { registeredUser, loginUser, logoutUser, refreshAccessToken, changeCurrPassword, getCurrUser, updateAccDetails, updateImage } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT }  from "../middlewares/auth.middleware.js";
import ApiError from "../utils/ApiError.js";

const validateImageType = (req, _, next) => {
    const { imageType } = req.params;
    if (imageType !== "avatar" && imageType !== "cover-image") {
        throw new ApiError(400, "Invalid image type. Use 'avatar' or 'cover'.");
    }
    next();
};

const router = Router();

router.post(
    "/register", 
    upload.fields([ {name: "avatar", maxCount: 1}, {name: "coverImage", maxCount: 1} ]),
    registeredUser
);

router.post("/login", loginUser);

router.post("/logout", verifyJWT, logoutUser);

router.post("/refresh-token", refreshAccessToken);

router.patch("/me/password", verifyJWT, changeCurrPassword);

router.get("/me", verifyJWT, getCurrUser );

router.patch("/me", verifyJWT, updateAccDetails );

router.patch("/me/images/:imageType", verifyJWT, validateImageType, 
    upload.fields([ {name: "avatar", maxCount: 1}, {name: "coverImage", maxCount: 1} ]), 
    updateImage
);

export default router;