import { Router } from "express";
import {
  signup,
  logout,
  login,
  getVendorWithUsers,
} from "../controllers/vendorController";
import { upload } from "../middlewares/upload";

const vendorRouter = Router();

vendorRouter.post(
  "/signup",
  upload.fields([
    { name: "aadharDoc", maxCount: 1 },
    {name: "aadharbackDoc", maxCount: 1 },
    { name: "panDoc", maxCount: 1 },
    { name: "BankDetailsDoc", maxCount: 1 },
    { name: "paymentProof", maxCount: 1 },
  ]),
  signup
);
vendorRouter.post("/login", login);
vendorRouter.post("/logout", logout);
vendorRouter.get("/getVendorWithUsers/:vendorId", getVendorWithUsers);

export default vendorRouter;
