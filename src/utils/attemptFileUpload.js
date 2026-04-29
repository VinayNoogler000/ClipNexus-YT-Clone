import { uploadAssetToCloudinary } from "./index.js";

export default async function attemptFileUpload(filePath) {
    if (!filePath) {
        return [new Error("File path is required"), 0];
    }
    
    let uploadAssetRes, uploadAttemptCount = 0;
    do {
        try {
            uploadAssetRes = await uploadAssetToCloudinary(filePath);
        }
        catch (err) {
            uploadAssetRes = err;
        }
        finally { uploadAttemptCount++; }
    } while ((uploadAssetRes instanceof Error && !uploadAssetRes.message.includes("File size too large")) && uploadAttemptCount < 5);

    return [uploadAssetRes, uploadAttemptCount];
}