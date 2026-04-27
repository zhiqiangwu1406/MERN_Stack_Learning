import fs from "fs";
import { uploadFileToCloudinary } from "../utils/cloudinary.js";
import { User } from "../model/user.js";
import jwt from "jsonwebtoken";
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

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User Not Found");
    }
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refresh_token = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw new Error("Something went wrong.");
  }
};

export const loginController = async (req, res) => {
  try {
    const { userOrEmail, password } = req.body;

    if (!(userOrEmail && password)) {
      return res.status(401).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({
      $or: [{ username: userOrEmail }, { email: userOrEmail }],
    });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found." });
    }
    const passwordMatch = await existingUser.isPasswordMatch(password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect Credentials." });
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      existingUser._id,
    );

    const cookieoptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    const userToLog = await User.findById(existingUser._id).select(
      "-password -refresh_token",
    );
    res
      .status(200)
      .cookie("accessToken", accessToken, cookieoptions)
      .cookie("refreshToken", refreshToken, cookieoptions)
      .json({ user: userToLog, message: "Login Success." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const generateNewRefreshToken = async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    return res.status(401).json({ message: "No token found!" });
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESHTOKEN_SECRETKEY,
    );
    const userId = decodedToken?._id;
    const existingUser = await User.findById(userId);

    if (!existingUser) {
      return res.status(404).json({ message: "No user found" });
    }

    if (incomingRefreshToken !== existingUser.refresh_token) {
      return res.status(401).json({ message: "invalid refresh token" });
    }
    const { newAccessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(userId);

    const cookieoptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };
    return res
      .status(200)
      .cookie("accessToken", newAccessToken, cookieoptions)
      .cookie("refreshToken", newRefreshToken, cookieoptions)
      .json({ message: "token updated" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
