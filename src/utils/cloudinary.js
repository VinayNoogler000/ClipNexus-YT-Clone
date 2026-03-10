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

    let response;
    try {
        // Upload the file
        response = await cloudinary.uploader.upload(filePath, { resource_type: "auto", asset_folder: "ClipNexus" });
        
    } catch (error) {
        response = error;
    }
    fs.unlinkSync(filePath); // removes the locally stored files (avatar/coverImg) from "/public/temp/"
    
    if (response.name === "Error") {
        throw new Error(`Error Uploading Image: ${response.message || "Internal Server Error"}`);
    }

    return response;
};

// Function to Delete a image/video file permanently
const deleteAssetFromCloudinary = (publicId) => {
    cloudinary.uploader.destroy(publicId, { invalidate: true })
    .then(result => console.log("Asset Delete Status: ", result.result))
    .catch((err) => console.error("Error in Deleting Asset: ", err));
}

export { uploadAssetToCloudinary, deleteAssetFromCloudinary };