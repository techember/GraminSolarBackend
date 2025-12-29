import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      index: true,
    },

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
      default: false,
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
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "verified", "completed", "rejected"],
      default: "pending",
    },
    processingMailSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

orderSchema.pre("save", async function (next) {
  if (this.orderId) return next();

  const count = await mongoose.model("Order").countDocuments();

  const year = new Date().getFullYear();
  this.orderId = `ORD-${year}-${String(count + 1).padStart(6, "0")}`;

  next();
});


export default mongoose.model("Order", orderSchema);
