import { Router } from "express";
import { registeredUser } from "../controllers/user.controller.js";

const router = Router();

router.post("/register", registeredUser);  

export default router;