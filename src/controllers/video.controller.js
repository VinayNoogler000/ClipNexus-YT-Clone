import { ApiError, ApiResponse, asyncHandler, attemptFileUpload, deleteTempFiles } from "../utils/index.js"
import { uploadAssetToCloudinary } from "../utils/index.js"
import fs from "fs";
import { Video } from "../models/video.model.js"
import { error } from "console";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video

    // Get Video-Data from the Client
    const { title, description } = req.body || {};
    const [videoFile, thumbnailFile] = [req.files?.videoFile, req.files?.thumbnail];

    // Validate the Video-Data from Client
    if (!title || !videoFile) {
        deleteTempFiles(videoFile?.[0].path, thumbnailFile?.[0].path);
        throw new ApiError(400, "Both Video Title and File are Required!");
    }

    // Upload the Video to Cloudinary
    const [videoUploadRes, uploadAttemptCount] = await attemptFileUpload(videoFile?.[0].path);

    if (!videoUploadRes) {
        deleteTempFiles(videoFile?.[0].path, thumbnailFile?.[0].path);
        throw new ApiError(503, "Video Upload Failed after multiple attempts. Please Try Again Later.");
    }

    // Upload Thumbnail to Cloudinary (if provided)
    const [thumbnailUploadRes, thumbnailUploadAttemptCount] = await attemptFileUpload(thumbnailFile?.[0].path);
    if (thumbnailUploadRes instanceof Error) deleteTempFiles(thumbnailFile?.[0].path);

    // Create a Video-Document and Add it to MongoDB
    const video = await Video.create({
        videoFile: videoUploadRes.secure_url,
        thumbnail: thumbnailUploadRes?.secure_url || videoUploadRes.eager?.[0]?.secure_url,
        title,
        description,
        duration: videoUploadRes.duration,
        owner: req.user._id
    });

    // Return a Valid Response to Client
    const thumbnailUploadFailed = thumbnailUploadRes instanceof Error;
    return res
        .status(201)
        .json(new ApiResponse(
            201, 
            { video }, 
            `Video Uploaded to Cloud Successfully after ${uploadAttemptCount} attempts, and Thumbnail ${thumbnailUploadFailed ? "failed to upload" : "uploaded successfully"} after ${thumbnailUploadAttemptCount} attempts ${thumbnailUploadFailed && thumbnailUploadRes.message.includes("File size too large") ? "(File size too large)" : (thumbnailUploadFailed ? `(${thumbnailUploadRes.message})` : "")}`
        ));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}