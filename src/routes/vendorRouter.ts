import { Router } from "express";
import { signup, logout, login } from "../controllers/vendorController";

const vendorRouter = Router();

vendorRouter.post("/signup", signup);
vendorRouter.post("/login", login);
vendorRouter.post("/logout", logout);

export default vendorRouter;
