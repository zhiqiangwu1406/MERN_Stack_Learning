import jwt from "jsonwebtoken";
import { User } from "../model/user.js";

export const verifyJWT = async (req, res, next) => {
  try {
    const incomingToken =
      req.cookies.accessToken || req.header("Authorization");

    if (!incomingToken) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    const decodedToken = jwt.verify(
      incomingToken,
      process.env.ACCESSTOKEN_SECRETKEY,
    );

    const user = await User.findById(decodedToken._id).select(
      "-password -refresh_token",
    );
    if (!user) {
      return res.status(404).json({ messge: "In middleware: User not found." });
    }

    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong." });
  }
};
