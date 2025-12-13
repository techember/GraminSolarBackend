import express from "express";
import { placeOrder, getAllOrders } from "../controllers/orderController";
import { protect } from "../middlewares/Middlewares";

const orderRouter = express.Router();

orderRouter.post("/", protect, placeOrder);
orderRouter.get("/", protect, getAllOrders);

export default orderRouter;
