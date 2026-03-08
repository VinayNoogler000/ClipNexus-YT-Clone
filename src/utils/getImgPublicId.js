export const getImgPublicIdUsingURLSync = (cloudinaryImgUrl) => {
    // This Function only public_id of the image for Cloudinary URLs
    if (!cloudinaryImgUrl) throw new Error("Image URL is Required!");

    const parts = cloudinaryImgUrl.split('/');
    const lastPart = parts.pop();
    const publicId = lastPart.split('.')[0];
    
    return publicId;
}