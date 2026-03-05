import { Router } from "express";
import { registeredUser, loginUser, logoutUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
    "/register", 
    upload.fields([ {name: "avatar", maxCount: 1}, {name: "coverImage", maxCount: 1} ]),
    registeredUser
);

router.post("/login", loginUser);

router.get("/logout", verifyJWT, logoutUser);

export default router;