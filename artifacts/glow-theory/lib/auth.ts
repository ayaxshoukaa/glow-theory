import { cookies } from "next/headers";
import jwt, { type JwtPayload } from "jsonwebtoken";

export const SESSION_COOKIE = "glow_theory_session";
const SESSION_ISSUER = "glow-theory";
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 7;

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured.");
  return secret;
}

export function createSessionToken(userId: string): string {
  return jwt.sign({}, jwtSecret(), {
    subject: userId,
    issuer: SESSION_ISSUER,
    expiresIn: SESSION_AGE_SECONDS,
  });
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_AGE_SECONDS,
  };
}

export async function getSessionUserId(): Promise<string | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, jwtSecret(), {
      issuer: SESSION_ISSUER,
    }) as JwtPayload;
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
