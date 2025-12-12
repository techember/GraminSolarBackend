import dotenv from "dotenv";
dotenv.config();

interface Config {
  port: number;
  MONGO_URL: string;
  JWT_PASSWORD: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  MONGO_URL: process.env.MONGO_URL || "", 
  JWT_PASSWORD: process.env.JWT_PASSWORD || "", 
};

export default config;