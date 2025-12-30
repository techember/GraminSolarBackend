import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config";
import { Contact, User } from "../modals/User";
import {
  signupSchema,
  loginSchema,
  contactSchema,
} from "../schemas/authSchemas";
import crypto from "crypto";
import { sendOtpViaRenflair } from "../utils/renflairsms";
import { Vendor } from "../modals/Vendor";
import mongoose from "mongoose";

export const signup = async (req: Request, res: Response): Promise<any> => {
  console.log(req.body);
  try {
    const {
      fullName,
      VendorReference,
      phoneNo,
      address,
      email,
      panCard,
      aadhaarNo,
      consumerNumber,
      password,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const files = req.files as {
      aadharfrontDoc?: Express.Multer.File[];
      aadharbackDoc?: Express.Multer.File[];
      panDoc?: Express.Multer.File[];
      electricityBillDoc?: Express.Multer.File[];
    };

    if (
      !files?.aadharfrontDoc?.[0] ||
      !files?.aadharbackDoc?.[0] ||
      !files?.panDoc?.[0] ||
      !files?.electricityBillDoc?.[0]
    ) {
      return res.status(400).json({ message: "All documents are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const user = new User({
      fullName,
      gmail: VendorReference || "",
      phoneNo,
      address,
      email,
      panCard,
      aadhaarNo,
      consumerNumber,
      password: hashedPassword,
      isPhoneVerified: false,
      signupOtp: hashedOtp,
      signupOtpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),

      aadhaarfrontDocument: {
        url: files.aadharfrontDoc[0].path,
        publicId: files.aadharfrontDoc[0].filename,
      },
      aadhaarbackDocument: {
        url: files.aadharbackDoc[0].path,
        publicId: files.aadharbackDoc[0].filename,
      },
      panCardDocument: {
        url: files.panDoc[0].path,
        publicId: files.panDoc[0].filename,
      },
      electricityDocument: {
        url: files.electricityBillDoc[0].path,
        publicId: files.electricityBillDoc[0].filename,
      },
    });

    await user.save();

    await sendOtpViaRenflair(phoneNo, otp);

    return res.status(201).json({
      message: "OTP sent to mobile. Verify to activate account.",
      userId: user._id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Signup failed" });
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
        status: user.status,
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

export const contact = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, message } = await contactSchema.parseAsync(req.body);

    if (!name) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!email) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!message) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const contactMessage = new Contact({
      name,
      email,
      message,
    });

    await contactMessage.save();

    return res.json({
      name: contactMessage.name,
      email: contactMessage.email,
      message: contactMessage.message,
    });
  } catch (error) {
    if ((error as any)?.issues) {
      return res.status(400).json({
        message: "Contact failed",
        errors: (error as any).issues,
      });
    }
    console.log("Contact error:", error);
    return res.status(500).json({ message: "Error submitting contact form" });
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(id).select("-password").lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Get user by id error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateMyProfile = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const userId = (req as any).userId;
    const updates = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // UNIQUE FIELD CHECKS
    if (updates.email && updates.email !== user.email) {
      const emailExists = await User.findOne({ email: updates.email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    if (updates.aadhaarNo && updates.aadhaarNo !== user.aadhaarNo) {
      const aadhaarExists = await User.findOne({
        aadhaarNo: updates.aadhaarNo,
      });
      if (aadhaarExists) {
        return res.status(400).json({ message: "Aadhaar already in use" });
      }
    }

    if (updates.panCard && updates.panCard !== user.panCard) {
      const panExists = await User.findOne({ panCard: updates.panCard });
      if (panExists) {
        return res.status(400).json({ message: "PAN already in use" });
      }
    }

    // PASSWORD UPDATE (RE-HASH)
    if (updates.password) {
      user.password = await bcrypt.hash(updates.password, 10);
    }

    // NORMAL FIELD UPDATES
    const editableFields = [
      "fullname",
      "address",
      "gmail",
      "phoneNo",
      "consumerNumber",
      "email",
      "aadhaarNo",
      "panCard",
    ] as const;

    editableFields.forEach((field) => {
      if (updates[field]) {
        (user as any)[field] = updates[field];
      }
    });

    // DOCUMENT UPDATES
    const files = req.files as {
      aadharfrontDoc?: Express.Multer.File[];
      aadharbackDoc?: Express.Multer.File[];
      panDoc?: Express.Multer.File[];
      electricityBillDoc?: Express.Multer.File[];
    };

    if (files?.aadharfrontDoc?.[0]) {
      user.aadhaarfrontDocument = {
        url: files.aadharfrontDoc[0].path,
        publicId: files.aadharfrontDoc[0].filename,
      };
    }

    if (files?.aadharbackDoc?.[0]) {
      user.aadhaarbackDocument = {
        url: files.aadharbackDoc[0].path,
        publicId: files.aadharbackDoc[0].filename,
      };
    }

    if (files?.panDoc?.[0]) {
      user.panCardDocument = {
        url: files.panDoc[0].path,
        publicId: files.panDoc[0].filename,
      };
    }

    if (files?.electricityBillDoc?.[0]) {
      user.electricityDocument = {
        url: files.electricityBillDoc[0].path,
        publicId: files.electricityBillDoc[0].filename,
      };
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        fullname: user.fullName,
        address: user.address,
        gmail: user.gmail,
        phoneNo: user.phoneNo,
        consumerNumber: user.consumerNumber,
        email: user.email,
        aadhaarNo: user.aadhaarNo,
        panCard: user.panCard,
        aadhaarFrontUrl: user.aadhaarfrontDocument?.url,
        aadhaarBackUrl: user.aadhaarbackDocument?.url,
        panCardUrl: user.panCardDocument?.url,
        electricityUrl: user.electricityDocument?.url,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const verifySignupOtp = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    console.log(req.body);
    const { id, otp, role } = req.body; // role: "user" | "vendor"

    const account = await User.findById(id);

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
