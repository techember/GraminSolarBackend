import { Router } from "express";
import { signup, logout, login, getAllUsers, getAllVendors, getUsersByVendor } from "../controllers/adminController";

const adminRouter = Router();

adminRouter.post("/signup", signup);
adminRouter.post("/login", login);
adminRouter.post("/logout", logout);
adminRouter.get("/getalluser",getAllUsers);
adminRouter.get("/getallvendors",getAllVendors);
adminRouter.get("/vendor/:vendorId/users", getUsersByVendor);

export default adminRouter;
