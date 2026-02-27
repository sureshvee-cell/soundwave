import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt    from "jsonwebtoken";
import { z }  from "zod";
import { prisma }     from "../server";
import { authenticate, type AuthRequest } from "../middleware/auth";
import { AppError }   from "../middleware/errorHandler";

const router = Router();

const JWT_SECRET   = process.env.JWT_SECRET!;
const JWT_REFRESH  = process.env.JWT_REFRESH_SECRET!;
const ACCESS_TTL   = "1h";
const REFRESH_TTL  = "7d";

function signTokens(userId: string, role: string, email: string) {
  const accessToken  = jwt.sign({ sub: userId, role, email }, JWT_SECRET,  { expiresIn: ACCESS_TTL });
  const refreshToken = jwt.sign({ sub: userId },               JWT_REFRESH, { expiresIn: REFRESH_TTL });
  return { accessToken, refreshToken, expiresIn: 3600 };
}

// POST /api/auth/register
const registerSchema = z.object({
  email:       z.string().email(),
  password:    z.string().min(8).max(100),
  username:    z.string().min(3).max(30).regex(/^[a-z0-9_]+$/i),
  displayName: z.string().min(1).max(50),
  role:        z.enum(["LISTENER", "ARTIST"]).default("LISTENER"),
});

router.post("/register", async (req, res, next) => {
  try {
    const body  = registerSchema.parse(req.body);
    const hash  = await bcrypt.hash(body.password, 12);

    const user  = await prisma.user.create({
      data: {
        email:        body.email.toLowerCase(),
        username:     body.username.toLowerCase(),
        displayName:  body.displayName,
        passwordHash: hash,
        role:         body.role,
        // Create free subscription automatically
        subscription: {
          create: { tier: "FREE", status: "ACTIVE" }
        },
        // Create artist profile if role is ARTIST
        ...(body.role === "ARTIST" ? {
          artist: {
            create: {
              name: body.displayName,
              slug: body.username.toLowerCase(),
            }
          }
        } : {}),
      },
      include: { subscription: true, artist: true },
    });

    const tokens = signTokens(user.id, user.role, user.email);
    await prisma.refreshToken.create({
      data: { token: tokens.refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 86400000) }
    });

    const { passwordHash: _, ...safeUser } = user;
    res.status(201).json({ success: true, data: { user: safeUser, tokens } });
  } catch (err) { next(err); }
});

// POST /api/auth/login
const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where:   { email: email.toLowerCase() },
      include: { subscription: true, artist: true },
    });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new AppError(401, "Invalid email or password");
    }

    const tokens = signTokens(user.id, user.role, user.email);
    await prisma.refreshToken.create({
      data: { token: tokens.refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 86400000) }
    });

    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, data: { user: safeUser, tokens } });
  } catch (err) { next(err); }
});

// POST /api/auth/refresh
router.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);
    const payload = jwt.verify(refreshToken, JWT_REFRESH) as { sub: string };

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError(401, "Invalid refresh token");
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new AppError(401, "User not found");

    // Rotate token
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    const tokens = signTokens(user.id, user.role, user.email);
    await prisma.refreshToken.create({
      data: { token: tokens.refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 86400000) }
    });

    res.json({ success: true, data: tokens });
  } catch (err) { next(err); }
});

// GET /api/auth/me
router.get("/me", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where:   { id: req.user!.id },
      include: { subscription: { include: { /* plan */ } }, artist: true },
    });
    if (!user) throw new AppError(404, "User not found");
    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  } catch (err) { next(err); }
});

// POST /api/auth/logout
router.post("/logout", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string().optional() }).parse(req.body);
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) { next(err); }
});

export default router;
