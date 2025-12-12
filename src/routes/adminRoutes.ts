import { Router } from "express";
import { signup, logout, login } from "../controllers/userController";

const adminRouter = Router();

adminRouter.post("/signup", signup);
adminRouter.post("/login", login);
adminRouter.post("/logout", logout);

export default adminRouter;
