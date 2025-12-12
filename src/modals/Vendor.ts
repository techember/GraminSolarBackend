import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  aadhaarNo: {
    type: String,
    required: true,
    unique: true,
  },
  panCard: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

export const Vendor = mongoose.model("Vendor", vendorSchema);
