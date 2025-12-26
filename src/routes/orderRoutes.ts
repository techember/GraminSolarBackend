import express from "express";
import { createOrder, getAllOrders, getOrderByOrderId, getOrdersByUser, updateOrder } from "../controllers/orderController";
import { protect } from "../middlewares/Middlewares";
import { upload } from "../middlewares/upload";

const orderRouter = express.Router();

orderRouter.post("/", upload.single("paymentProof"), protect, createOrder);
orderRouter.get("/", protect, getAllOrders);
orderRouter.put("/orders/:orderId", upload.single("paymentProof"), updateOrder);
orderRouter.get("/orders/user/:userId", getOrdersByUser);
orderRouter.get("/orders/:orderId", getOrderByOrderId);

export default orderRouter;
