import { Router } from "express";
import { signup, logout, login, getAllUsers, getAllVendors } from "../controllers/adminController";

const adminRouter = Router();

adminRouter.post("/signup", signup);
adminRouter.post("/login", login);
adminRouter.post("/logout", logout);
adminRouter.get("/getalluser",getAllUsers);
adminRouter.get("/getallvendors",getAllVendors);

export default adminRouter;
