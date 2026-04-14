import { v2 as cloudinary } from "cloudinary";

//configuration
// Return "https" URLs by setting secure: true
cloudinary.config({
  cloud_name: "Root",
  api_key: "471932777522983",
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
  secure: true,
});

export const uploadFileToCloudinary = async (filePath) => {
  try {
    if (!filePath) return true;
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    console.log("Uplaod successful", response.url);
  } catch (err) {
    console.log(err);
    return null;
  }
};
