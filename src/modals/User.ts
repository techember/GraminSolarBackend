// models/User.ts
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    address: { type: String, required: true },
    gmail: { type: String },
    phoneNo: { type: String, required: true },
    consumerNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
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
    password: { type: String, required: true },
    aadhaarDocument: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    panCardDocument: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
  },
  { timestamps: true },
);

const contactSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  message: { type: String },
});

export const User = mongoose.model("User", userSchema);
export const Contact = mongoose.model("Contact", contactSchema);
