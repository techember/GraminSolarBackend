import { Router } from "express";
import {
  signup,
  logout,
  login,
  getVendorWithUsers,
  verifySignupOtp,
} from "../controllers/vendorController";
import { upload } from "../middlewares/upload";

const vendorRouter = Router();

vendorRouter.post(
  "/signup",
  upload.fields([
    { name: "aadharfrontDoc", maxCount: 1 },
    {name: "aadharbackDoc", maxCount: 1 },
    { name: "panDoc", maxCount: 1 },
    { name: "BankDetailsDoc", maxCount: 1 },
    // { name: "paymentProof", maxCount: 1 },
  ]),
  signup
);
vendorRouter.post("/verify-signup-otp", verifySignupOtp);
vendorRouter.post("/login", login);
vendorRouter.post("/logout", logout);
vendorRouter.get("/getVendorWithUsers/:vendorId", getVendorWithUsers);
vendorRouter.post("/verify-signup-otp", verifySignupOtp);

export default vendorRouter;
