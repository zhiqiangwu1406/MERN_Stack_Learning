import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    profile_photo: {
      type: String,
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (this.isModified(this.password)) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordMatch = async function (pass) {
  return await bcrypt.compare(pass, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      password: this.password,
      email: this.email,
      username: this.username,
    },
    process.env.ACCESSTOKEN_SECRETKEY,
    { expiresIn: "1d" },
  );
};

userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESHTOKEN_SECRETKEY, {
    expiresIn: "1d",
  });
};

userSchema.plugin(mongooseAggregatePaginate);
export const User = mongoose.model("User", userSchema);
