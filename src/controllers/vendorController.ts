import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config";
import { signupSchema, loginSchema } from "../schemas/venderauthSchema";
import { Vendor } from "../modals/Vendor";
import { User } from "../modals/User";

export const signup = async (req: Request, res: Response): Promise<any> => {
  try {
    console.log(req.body);

    const { fullName, address, aadhaarNo, panCard, email, password, phoneNo } =
      await signupSchema.parseAsync(req.body);

    // Duplicate checks
    if (await Vendor.findOne({ email })) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (await Vendor.findOne({ aadhaarNo })) {
      return res.status(400).json({ message: "Aadhaar already exists" });
    }

    if (await Vendor.findOne({ panCard })) {
      return res.status(400).json({ message: "PAN already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // STATUS ADDED (default: pending)
    const newVendor = new Vendor({
      fullName,
      address,
      phoneNo,
      aadhaarNo,
      panCard,
      email,
      password: hashedPassword,
      status: "pending", // added
    });

    await newVendor.save();

    return res.status(201).json({
      message: "Vendor registered successfully",
      user: {
        id: newVendor._id,
        fullName: newVendor.fullName,
        email: newVendor.email,
        status: newVendor.status, // returned
      },
    });
  } catch (error) {
    console.log(error);
    if ((error as any)?.issues) {
      console.error("Signup validation error:", error);
      return res.status(400).json({
        message: "Validation failed",
        errors: (error as any).issues,
      });
    }

    console.error("Signup error:", error);
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

export const getUsersByVendor = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;

    const users = await User.find({ vendorId })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Users under vendor fetched successfully",
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    console.error("Get users by vendor error:", error);
    res.status(500).json({ message: "Failed to fetch vendor users" });
  }
};
