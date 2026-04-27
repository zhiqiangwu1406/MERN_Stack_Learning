import { Router } from "express";
import {
  generateNewRefreshToken,
  loginController,
  logoutController,
  registerController,
} from "../controllers/auth.js";
import { upload } from "../middlewares/multer_storage.js";
import { verifyJWT } from "../middlewares/auth.js";

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
router.post("/refresh", upload.none(), generateNewRefreshToken);
router.post("/logout", verifyJWT, logoutController);
export default router;
