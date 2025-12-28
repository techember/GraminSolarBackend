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

export const signup = async (req: Request, res: Response): Promise<any> => {
  try {
    console.log("Signup called with body:", req.body);
    const {
      fullname,
      VendorReference,
      phoneNo,
      address,
      email,
      panCard,
      aadhaarNo,
      consumerNumber,
      password,
    } = req.body;

    // CHECK IF USER ALREADY EXISTS (UNCHANGED)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists with email:", email);
      return res.status(400).json({ message: "Email already exists" });
    }

    // READ FILES UPLOADED VIA MULTER (UNCHANGED)
    const files = req.files as {
      aadharfrontDoc?: Express.Multer.File[];
      aadharbackDoc?: Express.Multer.File[];
      panDoc?: Express.Multer.File[];
      electricityBillDoc?: Express.Multer.File[];
    };

    const aadharfrontFile = files?.aadharfrontDoc?.[0];
    const aadharbackFile = files?.aadharbackDoc?.[0];
    const panFile = files?.panDoc?.[0];
    const electricityFile = files?.electricityBillDoc?.[0];

    if (!aadharfrontFile || !aadharbackFile || !panFile || !electricityFile) {
      return res.status(400).json({
        message: "Aadhaar and PAN documents are required",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // USER CREATION (UNCHANGED)
    const newUser = new User({
      gmail: VendorReference || "",
      fullname,
      phoneNo,
      panCard,
      aadhaarNo,
      consumerNumber,
      address,
      email,
      password: hashedPassword,
      aadhaarfrontDocument: {
        url: aadharfrontFile.path,
        publicId: aadharfrontFile.filename,
      },
      aadhaarbackDocument: {
        url: aadharbackFile.path,
        publicId: aadharbackFile.filename,
      },
      panCardDocument: {
        url: panFile.path,
        publicId: panFile.filename,
      },
      electricityDocument: {
        url: electricityFile.path,
        publicId: electricityFile.filename,
      },
    });

    await newUser.save();

    const jwtToken = jwt.sign({ id: newUser._id }, config.JWT_PASSWORD, {
      expiresIn: "7d",
    });

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "User created successfully",
      token: jwtToken, 
      user: {
        id: newUser._id,
        fullname: newUser.fullname,
        gmail: newUser.gmail,
        panCard: newUser.panCard,
        aadhaarNo: newUser.aadhaarNo,
        consumerNumber: newUser.consumerNumber,
        address: newUser.address,
        phoneNo: newUser.phoneNo,
        email: newUser.email,
        aadhaarfrontUrl: newUser.aadhaarfrontDocument!.url,
        aadhaarbackUrl: newUser.aadhaarbackDocument!.url,
        panCardUrl: newUser.panCardDocument!.url,
        electricityUrl: newUser.electricityDocument!.url,
      },
    });
  } catch (error) {
    if ((error as any)?.issues) {
      console.log("Signup validation error:", error);
      return res.status(400).json({
        message: "Validation failed",
        errors: (error as any).issues,
      });
    }

    console.log("Signup error:", error);
    return res.status(500).json({ message: "Error signing up" });
  }
};


export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 🔐 Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 🔒 Hash OTP before storing
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    user.loginOtp = hashedOtp;
    user.loginOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    await user.save();

    // 📩 Send SMS via Renflair
    const res = await sendOtpViaRenflair(user.phoneNo, otp);

    console.log("what the fuck",user.phoneNo, otp);

    

    return res.status(200).json({
      message: "OTP sent successfully",
      userId: user._id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to send OTP" });
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

export const getMyProfile = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const userId = (req as any).userId;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      message: "Server error",
    });
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
        fullname: user.fullname,
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


export const verifyLoginOtp = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user || !user.loginOtp) {
      return res.status(400).json({ message: "Invalid request" });
    }

    if (user.loginOtpExpiresAt! < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    if (hashedOtp !== user.loginOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP verified → cleanup
    user.loginOtp = undefined;
    user.loginOtpExpiresAt = undefined;
    await user.save();

    // Issue JWT
    const token = jwt.sign({ id: user._id }, config.JWT_PASSWORD, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "OTP verification failed" });
  }
};
