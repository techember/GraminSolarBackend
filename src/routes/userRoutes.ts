import { Router } from "express";
import { signup, logout, login, contact } from "../controllers/userController";
import { upload } from "../middlewares/upload";

const userRouter = Router();

userRouter.post(
  "/signup",
  upload.fields([
    { name: "aadharDoc", maxCount: 1 },
    {name: "aadharbackDoc", maxCount: 1 },
    { name: "panDoc", maxCount: 1 },
  ]),
  signup
);
userRouter.post("/login", login);
userRouter.post("/logout", logout);
userRouter.post("/contact", contact);

export default userRouter;
