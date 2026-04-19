import { uploadAssetToCloudinary } from "./index.js";

export default async function attemptFileUpload(filePath) {
    if (!filePath) {
        return [new Error("File path is required"), 0];
    }
    
    let uploadAssetRes, uploadAttemptCount = 0;
    do {
        uploadAssetRes = await uploadAssetToCloudinary(filePath);
        uploadAttemptCount++;
    } while (uploadAssetRes instanceof Error && uploadAttemptCount < 5);

    return [uploadAssetRes, uploadAttemptCount];
}