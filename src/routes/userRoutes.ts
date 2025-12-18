import { Router } from "express";
import { signup, logout, login, contact } from "../controllers/userController";
import { upload } from "../middlewares/upload";

const userRouter = Router();

userRouter.post(
  "/signup",
  upload.fields([
    { name: "aadhaarFile", maxCount: 1 },
    { name: "panCardFile", maxCount: 1 },
  ]),
  signup,
);
userRouter.post("/login", login);
userRouter.post("/logout", logout);
userRouter.post("/contact", contact);

export default userRouter;
