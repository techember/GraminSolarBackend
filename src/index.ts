import express from "express";
import mongoose from "mongoose";
import config from "./config";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRoutes";
import cors from "cors";
import adminRouter from "./routes/adminRoutes";
import vendorRouter from "./routes/vendorRouter";

mongoose
  .connect(config.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const app = express();
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173", // local dev frontend
      "", // production frontend
    ],
    credentials: true,
  }),
);

app.use(express.json());

// Routes
app.use("/api/auth", userRouter);
app.use("/api/auth", adminRouter);
app.use("/api/auth", vendorRouter);

// Start server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
