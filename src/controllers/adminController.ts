import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config";
import { signupSchema, loginSchema } from "../schemas/authSchemas";
import { Admin } from "../modals/Admin";
import { User } from "../modals/User";
import { Vendor } from "../modals/Vendor";

export const signup = async (req: Request, res: Response): Promise<any> => {
  try {
    const { fullname, email, password } = await signupSchema.parseAsync(
      req.body
    );

    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      fullname,
      email,
      password: hashedPassword,
    });

    await newAdmin.save();

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
      },
    });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
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

    const user = await Admin.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid credentials" });

    const jwtToken = jwt.sign({ id: user._id }, config.JWT_PASSWORD, {
      expiresIn: "7d",
    });

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: true, // Always true for HTTPS (Vercel)
      sameSite: "none", // Required for cross-domain cookies
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    //Return token and user data
    return res.json({
      message: "Login successful",
      token: jwtToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    // Better error handling for Zod validation
    if (error instanceof Error && "issues" in error) {
      console.error("Validation error:", error);
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

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password"); // hide password
    res.status(200).json({
      message: "All users fetched successfully",
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const getAllVendors = async (req: Request, res: Response) => {
  try {
    const vendors = await Vendor.find().select("-password"); // hide password
    res.status(200).json({
      message: "All vendors fetched successfully",
      vendors,
    });
  } catch (error) {
    console.error("Get vendors error:", error);
    res.status(500).json({ message: "Failed to fetch vendors" });
  }
};
