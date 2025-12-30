import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config";
import { signupSchema, loginSchema } from "../schemas/venderauthSchema";
import { Vendor } from "../modals/Vendor";
import { User } from "../modals/User";
import crypto from "crypto";
import { sendOtpViaRenflair } from "../utils/renflairsms";

export const signup = async (req: Request, res: Response): Promise<any> => {
  console.log(req.body);
  console.log(req.files);
  try {
    const { fullName, address, aadhaarNo, panCard, email, password, phoneNo } =
      req.body;

    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const files = req.files as {
      aadharfrontDoc?: Express.Multer.File[];
      aadharbackDoc?: Express.Multer.File[];
      panDoc?: Express.Multer.File[];
      BankDetailsDoc?: Express.Multer.File[];
      paymentProof?: Express.Multer.File[];
    };

    if (
      !files?.aadharfrontDoc?.[0] ||
      !files?.aadharbackDoc?.[0] ||
      !files?.panDoc?.[0] ||
      !files?.BankDetailsDoc?.[0] ||
      !files?.paymentProof?.[0]
    ) {
      return res.status(400).json({ message: "All documents required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const vendor = new Vendor({
      fullName,
      address,
      aadhaarNo,
      panCard,
      email,
      phoneNo,
      password: hashedPassword,
      isPhoneVerified: false,
      signupOtp: hashedOtp,
      signupOtpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),

      aadharfrontDoc: files.aadharfrontDoc[0].path,
      aadharbackDoc: files.aadharbackDoc[0].path,
      panDoc: files.panDoc[0].path,
      bankDoc: files.BankDetailsDoc[0].path,
      paymentProof: files.paymentProof[0].path,
    });

    await vendor.save();

    const res1 = await sendOtpViaRenflair(phoneNo, otp);
    console.log("renflaire", res1);

    return res.status(201).json({
      message: "OTP sent. Verify to activate vendor account.",
      vendorId: vendor._id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Vendor signup failed" });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = await loginSchema.parseAsync(req.body);

    const user = await Vendor.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const jwtToken = jwt.sign({ id: user._id }, config.JWT_PASSWORD, {
      expiresIn: "7d",
    });

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login successful",
      token: jwtToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        status: user.status, // useful on frontend
      },
    });
  } catch (error) {
    if ((error as any)?.issues) {
      return res.status(400).json({
        message: "Validation failed",
        errors: (error as any).issues,
      });
    }

    console.log("Login error:", error);
    return res.status(500).json({ message: "Error logging in" });
  }
};

export const logout = async (req: Request, res: Response): Promise<any> => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.status(200).json({ message: "Logged out successfully" });
};

export const getVendorWithUsers = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findOne({ email: vendorId }).select(
      "-password"
    );

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const users = await User.find({ gmail: vendorId })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Vendor with users fetched successfully",
      vendor,
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    console.log("Get vendor with users error:", error);
    res.status(500).json({ message: "Failed to fetch vendor details" });
  }
};
export const verifySignupOtp = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    console.log(req.body);
    const { id, otp, role } = req.body; // role: "user" | "vendor"

    const account = await Vendor.findById(id);

    console.log(account);

    if (!account || !account.signupOtp) {
      return res.status(400).json({ message: "Invalid request" });
    }

    if (account.signupOtpExpiresAt! < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    if (hashedOtp !== account.signupOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Activate account
    account.isPhoneVerified = true;
    account.signupOtp = undefined;
    account.signupOtpExpiresAt = undefined;
    await account.save();

    // Issue JWT
    const token = jwt.sign({ id: account._id }, config.JWT_PASSWORD, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Account verified successfully",
      token,
      user: {
        id: account._id,
        username: account.fullName,
        email: account.email,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "OTP verification failed" });
  }
};
