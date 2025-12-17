import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    power: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    registrationFee: {
      type: Number,
      required: true,
    },

    subsidy: {
      type: Number,
      required: true,
    },

    isReferred: {
      type: Boolean,
      default: false, // ✅ FIX
    },

    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },

    paymentProof: {
      type: String, // S3 / Cloudinary / local path
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
