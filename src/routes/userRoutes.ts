import { Router } from "express";
import {
  signup,
  logout,
  login,
  contact,
  getMyProfile,
  updateMyProfile,
} from "../controllers/userController";
import { upload } from "../middlewares/upload";
import { protect } from "../middlewares/Middlewares";

const userRouter = Router();

userRouter.post(
  "/signup",
  upload.fields([
    { name: "aadharfrontDoc", maxCount: 1 },
    {name: "aadharbackDoc", maxCount: 1 },
    { name: "panDoc", maxCount: 1 },
    { name: "electricityBillDoc", maxCount: 1 }, 
  ]),
  signup,
);
userRouter.post("/login", login);
userRouter.post("/logout", logout);
userRouter.post("/contact", contact);
userRouter.get("/me", protect, getMyProfile);

userRouter.put(
  "/me",
  protect,
  upload.fields([
    { name: "aadharDoc", maxCount: 1 },
    { name: "panDoc", maxCount: 1 },
  ]),
  updateMyProfile,
);

export default userRouter;
