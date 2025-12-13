import mongoose, { Schema, Document } from "mongoose";

const OrderSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },

    plan: {
      power: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      downpayment: {
        type: Number,
        required: true,
      },
      subsidy: {
        type: Number,
        required: true,
      },
    },
  },
  { timestamps: true },
);

export const Order = mongoose.model("Order", OrderSchema);
