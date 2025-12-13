import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";

interface JwtPayload {
  id: string;
}

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction,
): any => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_PASSWORD) as JwtPayload;

    // ✅ Attach userId (unchanged approach)
    (req as any).userId = decoded.id;

    // ✅ OPTIONAL: Attach location if provided
    const { latitude, longitude } = req.body || {};

    if (latitude !== undefined && longitude !== undefined) {
      (req as any).location = {
        latitude: Number(latitude),
        longitude: Number(longitude),
      };
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
