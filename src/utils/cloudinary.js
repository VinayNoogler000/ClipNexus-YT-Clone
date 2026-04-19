import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// Function to Uploads a image/video file
const uploadAssetToCloudinary = async (filePath) => {
    if (!filePath) {
        console.error("Please pass the 'filePath' as input to this function!");
        return null;
    }

    try {
        // Upload the file
        const response = await cloudinary.uploader.upload(filePath, { resource_type: "auto", asset_folder: "ClipNexus" });
        fs.unlinkSync(filePath); // removes the locally stored files (avatar/coverImg) from "/public/temp/"
        return response;
    } 
    catch (err) {
        throw new Error(`Error Uploading Asset: ${err.message || "Internal Server Error"}`);
    }
};

// Function to Delete a image/video file permanently
const deleteAssetFromCloudinary = (publicId) => {
    cloudinary.uploader.destroy(publicId, { invalidate: true })
    .then(result => console.log("Asset Delete Status: ", result.result))
    .catch((err) => console.error("Error in Deleting Asset: ", err));
}

export { uploadAssetToCloudinary, deleteAssetFromCloudinary };