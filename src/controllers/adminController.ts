import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config";
import { signupSchema, loginSchema } from "../schemas/authSchemas";
import { Admin } from "../modals/Admin";
import { User } from "../modals/User";
import { Vendor } from "../modals/Vendor";
import Order from "../modals/Order";
import vendorRouter from "../routes/vendorRouter";

// export const signup = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const { fullname, email, password, address, phoneNo } = await signupSchema.parseAsync(
//       req.body
//     );

//     const existingUser = await Admin.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "Email already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newAdmin = new Admin({
//       username: fullname,
//       email,
//       password: hashedPassword,
//       address,
//       phoneNo,
//     });

//     await newAdmin.save();

//     return res.status(201).json({
//       message: "User created successfully",
//       user: {
//         id: newAdmin._id,
//         username: newAdmin.username,
//         email: newAdmin.email,
//       },
//     });
//   } catch (error) {
//     if (error instanceof Error && "issues" in error) {
//       return res
//         .status(400)
//         .json({ message: "Validation failed", errors: error });
//     }

//     console.log("Signup error:", error);
//     return res.status(500).json({ message: "Error signing up" });
//   }
// };

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
      console.log("Validation error:", error);
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

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password"); // hide password
    res.status(200).json({
      message: "All users fetched successfully",
      users,
    });
  } catch (error) {
    console.log("Get users error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const getAllVendors = async (req: Request, res: Response) => {
  try {
    const vendors = await Vendor.find().select("-password");
    console.log(vendors); // hide password
    res.status(200).json({
      message: "All vendors fetched successfully",
      vendors,
    });
  } catch (error) {
    console.log("Get vendors error:", error);
    res.status(500).json({ message: "Failed to fetch vendors" });
  }
};

export const getUsersByVendor = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;

    const users = await User.find({ vendorId })
      .select("-password")
      .populate({
        path: "vendorId",
        select: "fullName email phoneNo status address", // avoid password
      })
      .sort({ createdAt: -1 });


    res.status(200).json({
      message: "Users under vendor fetched successfully",
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    console.log("Get users by vendor error:", error);
    res.status(500).json({ message: "Failed to fetch vendor users" });
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // VALID STATUS CHECK (MATCHES SCHEMA)
    const allowedStatuses = ["pending", "verified", "rejected", "completed"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Allowed values: pending, verified, rejected",
      });
    }

    // FIND ORDER
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // UPDATE STATUS
    order.status = status;
    await order.save();

    return res.status(200).json({
      message: "Order status updated successfully",
      orderId: order._id,
      status: order.status,
    });
  } catch (error) {
    console.log("Update order status error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
export const updateVendorStatus = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { vendorId } = req.params;
    const { status } = req.body;

    // ✅ VALID STATUS CHECK (MATCHES SCHEMA)
    const allowedStatuses = ["pending", "approved", "rejected"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Allowed values: pending, approved, rejected",
      });
    }

    // ✅ FIND ORDER
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found",
      });
    }

    // ✅ OPTIONAL: Prevent re-verifying rejected orders
    if (vendor.status === "approved") {
      return res.status(400).json({
        message: "Approved orders cannot be modified",
      });
    }

    // ✅ UPDATE STATUS
    vendor.status = status;

    console.log(vendor)
    await vendor.save();

    return res.status(200).json({
      message: "Vendor status updated successfully",
      vendorId : vendor._id,
      status: vendor.status,
    });
  } catch (error) {
    console.log("Update vendor status error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateVendorCommission = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { vendorId } = req.params;
    const { commission } = req.body;

    // ✅ VALIDATE COMMISSION
    if (commission === undefined || commission === null) {
      return res.status(400).json({
        message: "Commission amount is required",
      });
    }

    if (typeof commission !== "number" || commission < 0) {
      return res.status(400).json({
        message: "Commission must be a non-negative number",
      });
    }

    // ✅ FIND VENDOR
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found",
      });
    }

    // ✅ UPDATE COMMISSION
    vendor.commission = commission;
    await vendor.save();

    return res.status(200).json({
      message: "Vendor commission updated successfully",
      vendorId: vendor._id,
      vendorName: vendor.fullName,
      commission: vendor.commission,
    });
  } catch (error) {
    console.error("Update vendor commission error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};