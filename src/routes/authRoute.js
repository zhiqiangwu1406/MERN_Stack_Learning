import { Router } from "express";
import { registerController } from "../controllers/auth.js";
import { upload } from "../middlewares/multer_storage.js";
import { loginController } from "../controllers/auth.js";

const router = Router();

router.post(
  "/register",
  upload.fields([
    { name: "profile_photo", maxCount: 1 },
    { name: "cover_photo", maxCount: 1 },
  ]),
  registerController,
);

router.post("/login", upload.none(), loginController);

export default router;
