import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { configDotenv } from "dotenv";
configDotenv({ path: ".env" });
//configuration
// Return "https" URLs by setting secure: true
cloudinary.config({
  cloud_name: "dwupw5wei",
  api_key: "471932777522983",
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
  secure: true,
});

export const uploadFileToCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    console.log("Uplaod successful", response.url);
    fs.unlinkSync(filePath);
    return response.url;
  } catch (err) {
    console.log("Cloudinary Error", err);
    fs.unlinkSync(filePath);
    return null;
  }
};
