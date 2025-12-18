import express from "express";
import { createOrder, getAllOrders } from "../controllers/orderController";
import { protect } from "../middlewares/Middlewares";
import { upload } from "../middlewares/upload";

const orderRouter = express.Router();

orderRouter.post("/", upload.single("paymentProof"), protect, createOrder);
orderRouter.get("/", protect, getAllOrders);

export default orderRouter;
