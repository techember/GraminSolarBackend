import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import mongoose from "mongoose";

interface JwtPayload {
  id: string;
}

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, config.JWT_PASSWORD) as JwtPayload;
    

(req as any).userId = new mongoose.Types.ObjectId(decoded.id);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
