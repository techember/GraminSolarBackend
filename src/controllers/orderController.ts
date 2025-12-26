import { Request, Response } from "express";
import Order from "../modals/Order";

export const createOrder = async (req: Request, res: Response) => {
  console.log("Create Order called with body:", req.body);
  try {
    const userId = (req as any).userId;
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
      user: userId,
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
    console.log("Order creation error:", err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getAllOrders = async (
  req: Request,
  res: Response,
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

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const {
      power,
      price,
      registrationFee,
      subsidy,
      location,
      status,
      isReferred,
    } = req.body;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // PARSE LOCATION IF PROVIDED
    let parsedLocation;
    if (location) {
      try {
        parsedLocation =
          typeof location === "string" ? JSON.parse(location) : location;
      } catch {
        return res.status(400).json({
          message: "Invalid location data",
        });
      }
    }

    // UPDATE FIELDS IF PRESENT
    if (power) order.power = power;
    if (price) order.price = Number(price);
    if (registrationFee) order.registrationFee = Number(registrationFee);
    if (subsidy) order.subsidy = Number(subsidy);
    if (typeof isReferred === "boolean") order.isReferred = isReferred;

    if (parsedLocation?.latitude && parsedLocation?.longitude) {
      order.location = {
        latitude: Number(parsedLocation.latitude),
        longitude: Number(parsedLocation.longitude),
      };
    }

    if (status) {
      order.status = status; // pending | verified | rejected
    }

    // UPDATE PAYMENT PROOF IF NEW FILE UPLOADED
    if (req.file) {
      order.paymentProof = req.file.path;
    }

    await order.save();

    res.status(200).json({
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error("Order update error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getOrdersByUser = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { userId } = req.params;
    console.log("Fetching orders for userId:", userId);

    const orders = await Order.find({ user: userId })
      .populate("user", "-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getOrderByOrderId = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId }).populate(
      "user",
      "-password",
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      order,
    });
  } catch (error) {
    console.error("Get order by orderId error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};
