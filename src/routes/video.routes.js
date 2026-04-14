import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { deleteVideo, getAllVideos, getVideoById, publishVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller";

const router = Router();

router.get("/", getAllVideos);
router.post("/", verifyJWT, publishVideo);
router.get("/:videoId", getVideoById);
router.patch("/:videoId", verifyJWT, updateVideo);
router.delete("/:videoId", verifyJWT, deleteVideo);
router.patch("/:videoId/publish-status", verifyJWT, togglePublishStatus);

export default router;