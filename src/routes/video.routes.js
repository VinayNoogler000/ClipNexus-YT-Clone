import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, publishVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.get("/", getAllVideos);
router.post("/", verifyJWT, 
    upload.fields([ 
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 } 
    ]), 
    publishVideo);
router.get("/:videoId", getVideoById);
router.patch("/:videoId", verifyJWT, updateVideo);
router.delete("/:videoId", verifyJWT, deleteVideo);
router.patch("/:videoId/publish-status", verifyJWT, togglePublishStatus);

export default router;