import express from "express";
import mongoose from "mongoose";
import config from "./config";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRoutes";
import cors from "cors";
import adminRouter from "./routes/adminRoutes";
import vendorRouter from "./routes/vendorRouter";
import orderRouter from "./routes/orderRoutes";

mongoose
  .connect(config.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const app = express();
app.use(cookieParser());

// CORS setup for localhost:5173
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://www.deekshagraminsolar.online",
      "http://localhost:3000",
    ],
    credentials: true,
  }),
);

app.use(express.json());

// Routes
app.use("/api/userAuth", userRouter);
app.use("/api/adminAuth", adminRouter);
app.use("/api/venderAuth", vendorRouter);
app.use("/api/orders", orderRouter);

// Start server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
