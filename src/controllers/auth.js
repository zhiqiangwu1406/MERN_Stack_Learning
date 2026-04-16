import fs from "fs";
import { uploadFileToCloudinary } from "../utils/cloudinary.js";
import { User } from "../model/user.js";
export const registerController = async (req, res) => {
  let profile_photo_filepath, cover_photo_filepath;
  try {
    profile_photo_filepath = req.files.profile_photo[0].path;
    cover_photo_filepath = req.files.cover_photo[0].path;

    const { username, email, password } = req.body;
    if ([username, email, password].some((f) => f.trim() === "")) {
      res.status(401).json({ message: "All fields are required" });
      throw new Error("All fields are required.");
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      res.status(409).json({ message: "User already existed." });
      throw new Error("User already existed.");
    }

    const profile_photo = await uploadFileToCloudinary(profile_photo_filepath);
    const cover_photo = await uploadFileToCloudinary(cover_photo_filepath);

    const newUser = await User.create({
      username: username.toLowerCase(),
      email,
      password,
      profile_photo,
      cover_photo,
    });

    const createdUser = await User.findById(newUser._id).select(
      "-password -refreshToken",
    );

    if (!createdUser) {
      return res.status(500).json({ message: "Internal server error" });
    }

    return res
      .status(200)
      .json({ createdUser, message: "Registration successful." });
  } catch (error) {
    console.log("Catch block: ", error);
    profile_photo_filepath && fs.existsSync(profile_photo_filepath)
      ? fs.unlinkSync(profile_photo_filepath)
      : null;
    cover_photo_filepath && fs.existsSync(cover_photo_filepath)
      ? fs.unlinkSync(cover_photo_filepath)
      : null;
  }
};
