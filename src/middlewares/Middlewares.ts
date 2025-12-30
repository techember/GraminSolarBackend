import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";

interface JwtPayload {
  id: string;
}

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  try {
    console.log("PROTECT MIDDLEWARE HIT");
    const authHeader = req.headers.authorization;
    console.log("AUTH HEADER RECEIVED:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, config.JWT_PASSWORD) as JwtPayload;
    

    // ✅ Attach ONLY userId
    (req as any).userId = decoded.id;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
