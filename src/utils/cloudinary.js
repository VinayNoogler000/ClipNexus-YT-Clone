import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// Function to Uploads a image/video file
const uploadAssetToCloudinary = async (filePath) => {
    try {
        if (!filePath) {
            console.log("Please pass the 'filePath' as input to this function!");
            return null;
        }

        // Upload the file
        const response = await cloudinary.uploader.upload(filePath, { resource_type: "auto" });
        console.log("File Successfully Uploaded \nResponse: " + response);
        return response;
    } catch (error) {
        fs.unlinkSync(filePath); // removes/deletes the locally stored file (in "/public/temp")
        console.error("Error in Uploading Image: " + error);
        return null;
    }
};

export { uploadAssetToCloudinary };