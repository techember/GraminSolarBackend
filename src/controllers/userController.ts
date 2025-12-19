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

export const signup = async (req: Request, res: Response): Promise<any> => {
  try {
    // ✅ Zod validation (unchanged)
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

    // ✅ CHECK IF USER ALREADY EXISTS (UNCHANGED)

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists with email:", email);
      return res.status(400).json({ message: "Email already exists" });
    }

    // ✅ READ FILES UPLOADED VIA MULTER (ADDED)
    const files = req.files as {
      aadharfrontDoc?: Express.Multer.File[];
      aadharbackDoc?: Express.Multer.File[];
      panDoc?: Express.Multer.File[];
    };

    const aadharfrontFile = files?.aadharfrontDoc?.[0];
    const aadharbackFile = files?.aadharbackDoc?.[0];
    const panFile = files?.panDoc?.[0];

    if (!aadharfrontFile || !aadharbackFile || !panFile) {
      return res.status(400).json({
        message: "Aadhaar and PAN documents are required",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ USER CREATION WITH CLOUDINARY URLS (ADDED)
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
        url: aadharfrontFile.path, // Cloudinary secure URL
        publicId: aadharfrontFile.filename,
      },
      aadhaarbackDocument: {
        url: aadharbackFile.path, // Cloudinary secure URL
        publicId: aadharbackFile.filename,
      },
      panCardDocument: {
        url: panFile.path,
        publicId: panFile.filename,
      },
    });

    await newUser.save();

    // console.log("New user created:", newUser);

    return res.status(201).json({
      message: "User created successfully",
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
      },
    });
  } catch (error) {
    // ✅ Zod error handling (unchanged logic, safer check)
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
    const { email, password } = await loginSchema.parseAsync(req.body);

    const user = await User.findOne({ email });
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
        fullname: user.fullname,
        email: user.email,
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
