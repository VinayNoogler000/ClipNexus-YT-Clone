import { Router } from "express";
import { registeredUser, loginUser, logoutUser, refreshAccessToken, changeCurrPassword, getCurrUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT }  from "../middlewares/auth.middleware.js";

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

export default router;