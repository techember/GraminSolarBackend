import { Router } from "express";
import { signup, logout, login, contact } from "../controllers/userController";
import { upload } from "../middlewares/upload";

const userRouter = Router();

userRouter.post(
  "/signup",
  upload.fields([
<<<<<<< HEAD
    { name: "aadhaarFile", maxCount: 1 },
    { name: "panCardFile", maxCount: 1 },
  ]),
  signup,
=======
    { name: "aadharDoc", maxCount: 1 },
    { name: "panDoc", maxCount: 1 },
  ]),
  signup
>>>>>>> 141add7e0b1cbad6cfc101334514ff7b0c6efe5a
);
userRouter.post("/login", login);
userRouter.post("/logout", logout);
userRouter.post("/contact", contact);

export default userRouter;
