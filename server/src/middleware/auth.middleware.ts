import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({
      message: "Access token is required",
    });
  }

  try {
    const decoded: jwt.JwtPayload | string = jwt.verify(token, JWT_SECRET!);

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      !("id" in decoded) ||
      !("role" in decoded)
    ) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    req.user = {
      id: Number(decoded.id),
      role: String((decoded as jwt.JwtPayload).role),
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}