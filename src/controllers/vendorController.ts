import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config";
import { signupSchema, loginSchema } from "../schemas/venderauthSchema";
import { Vendor } from "../modals/Vendor";
import { User } from "../modals/User";

export const signup = async (req: Request, res: Response): Promise<any> => {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const { fullName, address, aadhaarNo, panCard, email, password, phoneNo } =
      await signupSchema.parseAsync(req.body);

    console.log("Validated data:",req.files);

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    if (
      !files?.aadharfrontDoc ||
      !files?.aadharbackDoc ||
      !files?.panDoc ||
      !files?.BankDetailsDoc ||
      !files?.paymentProof
    ) {
      return res.status(400).json({
        message: "All documents and payment proof are required",
      });
    }

    console.log("All required files are present.");

    // Duplicate checks
    if (await Vendor.findOne({ email })) {
      console.log("Email already exists:", email);
      return res.status(400).json({ message: "Email already exists" });
    }
    if (await Vendor.findOne({ aadhaarNo })) {
      console.log("Aadhaar already exists:", aadhaarNo);
      return res.status(400).json({ message: "Aadhaar already exists" });
    }
    if (await Vendor.findOne({ panCard })) {
      console.log("PAN already exists:", panCard);
      return res.status(400).json({ message: "PAN already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Creating new Vendor...");  

    const newVendor = new Vendor({
      fullName,
      address,
      phoneNo,
      aadhaarNo,
      panCard,
      email,
      password: hashedPassword,
      status: "pending",

      // ✅ FILE PATHS (example)
      aadharfrontDoc: files.aadharfrontDoc[0].path,
      aadharbackDoc: files.aadharbackDoc[0].path,
      panDoc: files.panDoc[0].path,
      bankDoc: files.BankDetailsDoc[0].path,
      paymentProof: files.paymentProof[0].path,
    });

    await newVendor.save();

    return res.status(201).json({
      message: "Vendor registered successfully, verification pending",
      vendorId: newVendor._id,
    });
  } catch (error) {
    console.log("Vendor signup error:", error);

    if ((error as any)?.issues) {
      return res.status(400).json({
        message: "Validation failed",
        errors: (error as any).issues,
      });
    }

    return res.status(500).json({ message: "Error signing up" });
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

    const vendor = await Vendor.findOne({email: vendorId}).select("-password");

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
