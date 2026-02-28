import { Router } from "express";
import { registeredUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

const uploadMiddleware = upload.fields([ {name: "avatar", maxCount: 1}, {name: "coverImage", maxCount: 1} ]);
router.post("/register", uploadMiddleware, registeredUser);  

export default router;