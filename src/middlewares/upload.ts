import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "orders/payment-proofs",
    allowed_formats: ["jpg", "jpeg", "png"],
  } as any,
});

export const upload = multer({ storage });
