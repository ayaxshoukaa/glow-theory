import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";
import { jsonError, publicUser, serverError } from "@/lib/http";
import User from "@/models/User";

export const runtime = "nodejs";

const signupSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Enter a name, valid email, and password of at least 8 characters.", 400);
  }

  try {
    await connectToDatabase();
    const email = parsed.data.email.toLowerCase();
    const existing = await User.exists({ email });
    if (existing) return jsonError("An account with this email already exists.", 409);

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await User.create({
      name: parsed.data.name,
      email,
      passwordHash,
    });

    const response = NextResponse.json(publicUser(user), { status: 201 });
    response.cookies.set(
      SESSION_COOKIE,
      createSessionToken(user._id.toString()),
      sessionCookieOptions(),
    );
    return response;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return jsonError("An account with this email already exists.", 409);
    }
    return serverError();
  }
}
