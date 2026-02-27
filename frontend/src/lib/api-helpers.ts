/**
 * Helpers for Next.js App Router API Route Handlers
 * — Auth, response factories, error handling
 */

import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { z, ZodSchema, ZodTypeAny } from "zod";

// ── Response factories ────────────────────────────────────────────────────────

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function created<T>(data: T) {
  return ok(data, 201);
}

export function err(message: string, status = 400, extra?: object) {
  return NextResponse.json({ success: false, message, ...extra }, { status });
}

// ── Auth helpers ──────────────────────────────────────────────────────────────

const JWT_SECRET  = new TextEncoder().encode(process.env.JWT_SECRET!);
const JWT_REFRESH = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!);

export interface JwtPayload {
  sub:   string;
  role:  string;
  email: string;
  iat:   number;
  exp:   number;
}

export async function signAccess(userId: string, role: string, email: string): Promise<string> {
  return new SignJWT({ role, email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(JWT_SECRET);
}

export async function signRefresh(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_REFRESH);
}

export async function verifyAccess(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload as unknown as JwtPayload;
}

export async function verifyRefresh(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, JWT_REFRESH);
  return payload as unknown as JwtPayload;
}

/** Extract & verify Bearer token from request */
export async function getAuthUser(req: NextRequest): Promise<JwtPayload | null> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  try {
    return await verifyAccess(header.slice(7));
  } catch {
    return null;
  }
}

/** Require auth — returns user or throws 401 response */
export async function requireAuth(req: NextRequest): Promise<JwtPayload> {
  const user = await getAuthUser(req);
  if (!user) throw NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  return user;
}

/** Require a specific role */
export async function requireRole(req: NextRequest, ...roles: string[]): Promise<JwtPayload> {
  const user = await requireAuth(req);
  if (!roles.includes(user.role)) {
    throw NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }
  return user;
}

// ── Validation helper ─────────────────────────────────────────────────────────

export async function parseBody<T>(req: NextRequest, schema: ZodSchema<T>): Promise<T> {
  const body = await req.json().catch(() => ({}));
  const result = schema.safeParse(body);
  if (!result.success) {
    throw NextResponse.json({
      success: false,
      message: "Validation error",
      errors:  result.error.errors.map(e => ({ field: e.path.join("."), message: e.message })),
    }, { status: 400 });
  }
  return result.data;
}

export function parseSearchParams<S extends ZodTypeAny>(params: URLSearchParams, schema: S): z.infer<S> {
  const obj = Object.fromEntries(params.entries());
  const result = schema.safeParse(obj);
  if (!result.success) {
    throw NextResponse.json({
      success: false,
      message: "Invalid query parameters",
      errors:  result.error.errors,
    }, { status: 400 });
  }
  return result.data as z.infer<S>;
}

// ── Route handler wrapper (catches thrown NextResponse) ───────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Handler = (req: NextRequest, ctx: { params: any }) => Promise<NextResponse>;

export function route(fn: Handler): Handler {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (thrown) {
      // Re-throw NextResponse objects (from requireAuth, etc.)
      if (thrown instanceof NextResponse) return thrown;

      // Zod errors
      if (thrown && typeof thrown === "object" && "name" in thrown && (thrown as { name: string }).name === "ZodError") {
        return err("Validation error", 400);
      }

      // Prisma unique violation
      if (thrown && typeof thrown === "object" && "code" in thrown && (thrown as { code: string }).code === "P2002") {
        return err("Resource already exists", 409);
      }

      console.error("API error:", thrown);
      return err(
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : String((thrown as Error)?.message ?? thrown),
        500
      );
    }
  };
}
