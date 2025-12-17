import { Request, Response } from "express";
import Order from "../modals/Order";

export const createOrder = async (req: Request, res: Response) => {
  console.log("Create Order called with body:", req.body);
  try {
    const { power, price, registrationFee, subsidy, location } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "Payment screenshot is required",
      });
    }

    // ✅ PARSE LOCATION
    let parsedLocation;
    try {
      parsedLocation =
        typeof location === "string" ? JSON.parse(location) : location;
    } catch {
      return res.status(400).json({
        message: "Invalid location data",
      });
    }

    // ✅ VALIDATION
    if (
      !power ||
      !price ||
      !registrationFee ||
      !subsidy ||
      !parsedLocation?.latitude ||
      !parsedLocation?.longitude
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const order = await Order.create({
      power,
      price: Number(price),
      registrationFee: Number(registrationFee),
      subsidy: Number(subsidy),
      location: {
        latitude: Number(parsedLocation.latitude),
        longitude: Number(parsedLocation.longitude),
      },
      paymentProof: req.file.path,
      // isReferred → default false
    });

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getAllOrders = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const orders = await Order.find()
      .populate("user", "-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};
