import dotenv from "dotenv";
dotenv.config();

interface Config {
  port: number;
  MONGO_URL: string;
  JWT_PASSWORD: string;
  ProdDevOrigin: string;
  localDevOrigin: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  MONGO_URL: process.env.MONGO_URL || "",
  JWT_PASSWORD: process.env.JWT_PASSWORD || "",
  ProdDevOrigin: process.env.ProdDevOrigin || "",
  localDevOrigin: process.env.localDevOrigin || "",
};

export default config;
