import { Request, Response } from "express";
import { Order } from "../modals/Order";

export const placeOrder = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).userId;

    const { power, price, downpayment, subsidy } = req.body;

    if (!power || !price || !downpayment || !subsidy) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const order = await Order.create({
      user: userId,
      plan: {
        power,
        price,
        downpayment,
        subsidy,
      },
    });

    return res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

export const getAllOrders = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const orders = await Order.find()
      .populate("user", "fullName email") // adjust fields
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};
