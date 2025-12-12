import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config";
import { signupSchema, loginSchema } from "../schemas/venderauthSchema";
import { Vendor } from "../modals/Vendor";

export const signup = async (req: Request, res: Response): Promise<any> => {
  try {
    // ⬇️ Updated fields added here
    console.log(req.body);
    const { fullName, address, aadhaarNo, panCard, email, password, phoneNo } =
      await signupSchema.parseAsync(req.body);

    // Check duplicate email
    const existingEmail = await Vendor.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Check duplicate Aadhaar
    const existingAadhaar = await Vendor.findOne({ aadhaarNo });
    if (existingAadhaar) {
      return res.status(400).json({ message: "Aadhaar already exists" });
    }

    // Check duplicate PAN
    const existingPan = await Vendor.findOne({ panCard });
    if (existingPan) {
      return res.status(400).json({ message: "PAN already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ⬇️ Updated user creation
    const newVendor = new Vendor({
      fullName,
      address,
      phoneNo,
      aadhaarNo,
      panCard,
      email,
      password: hashedPassword,
    });

    await newVendor.save();

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: newVendor._id,
        fullName: newVendor.fullName, // ⬅️ Updated
        email: newVendor.email,
      },
    });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      console.log(error);
      return res
        .status(400)
        .json({ message: "Validation failed", errors: error });
    }

    console.error("Signup error:", error);
    return res.status(500).json({ message: "Error signing up" });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = await loginSchema.parseAsync(req.body);

    const user = await Vendor.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate token
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
        fullName: user.fullName, // ⬅️ Updated
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return res.status(400).json({
        message: "Validation failed",
        errors: (error as any).issues,
      });
    }

    console.error("Login error:", error);
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
