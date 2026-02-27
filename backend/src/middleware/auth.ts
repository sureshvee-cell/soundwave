import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../server";

export interface AuthRequest extends Request {
  user?: { id: string; role: string; email: string };
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string; role: string; email: string };
    // Optionally verify user still exists in DB (for revocation support)
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return next();
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string; role: string; email: string };
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
  } catch { /* ignore */ }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: insufficient role" });
    }
    next();
  };
}

export function requirePremium(req: AuthRequest, res: Response, next: NextFunction) {
  // This middleware checks subscription tier
  // Called after authenticate()
  prisma.subscription.findUnique({ where: { userId: req.user!.id } })
    .then(sub => {
      if (!sub || sub.status !== "ACTIVE" || sub.tier === "FREE") {
        return res.status(402).json({
          success: false,
          message: "Premium subscription required",
          upgradeUrl: "/subscribe",
        });
      }
      next();
    })
    .catch(next);
}
