import dotenv from "dotenv";
dotenv.config();

interface Config {
  port: number;
  MONGO_URL: string;
  JWT_PASSWORD: string;

  ProdDevOrigin: string;
  localDevOrigin: string;

  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,

  MONGO_URL: process.env.MONGO_URL || "",
  JWT_PASSWORD: process.env.JWT_PASSWORD || "",

  ProdDevOrigin: process.env.ProdDevOrigin || "",
  localDevOrigin: process.env.localDevOrigin || "",

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
};

export default config;
