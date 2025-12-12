// models/User.ts
import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export const Vendor = mongoose.model("Vendor", vendorSchema);
