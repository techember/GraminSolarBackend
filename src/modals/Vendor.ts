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
  },
  panCard: {
    type: String,
    required: true,
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
  phoneNo: {
    type: String,
    required: true,
  },
  aadharfrontDoc: {
    type: String,
    required: true,
  },
  aadharbackDoc: {
    type: String,
    required: true,
  },
  panDoc: {
    type: String,
    required: true,
  },
  bankDoc: {
    type: String,
    required: true,
  },
  paymentProof: {
    type: String,
    // required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  commission: {
    type: Number,
    default: 0,
  },
  signupOtp: {
    type: String,
  },
  signupOtpExpiresAt: {
    type: Date,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
});

export const Vendor = mongoose.model("Vendor", vendorSchema);
