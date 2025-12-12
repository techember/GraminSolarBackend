import { Router } from "express";
import { signup, logout, login } from "../controllers/userController";

const userRouter = Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.post("/logout", logout);

export default userRouter;
