import { Request, Response } from "express";
import { Order } from "../modals/Order";

/**
 * PLACE ORDER
 */
export const placeOrder = async (req: Request, res: Response): Promise<any> => {
  console.log(req.body);
  try {
    const userId = (req as any).userId;
    const location = (req as any).location;

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
      location: location || undefined,
    });

    return res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
<<<<<<< HEAD
    console.log(error);
    return res.status(500).json({ message: "Server error", error });
=======
    return res.status(500).json({
      message: "Server error",
      error,
    });
>>>>>>> 31e0151 (location crap added)
  }
};

/**
 * GET ALL ORDERS
 */
export const getAllOrders = async (
  req: Request,
  res: Response,
): Promise<any> => {console.log(req.body);
  try {  

    const orders = await Order.find()
      .populate("user", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
<<<<<<< HEAD
    console.log(error);
    return res.status(500).json({ message: "Server error", error });
=======
    return res.status(500).json({
      message: "Server error",
      error,
    });
>>>>>>> 31e0151 (location crap added)
  }
};
