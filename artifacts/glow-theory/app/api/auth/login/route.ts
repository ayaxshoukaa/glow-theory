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

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Enter a valid email and password.", 400);
  }

  try {
    await connectToDatabase();
    const user = await User.findOne({
      email: parsed.data.email.toLowerCase(),
    })
      .select("+passwordHash")
      .exec();
    const passwordMatches =
      user && (await bcrypt.compare(parsed.data.password, user.passwordHash));
    if (!user || !passwordMatches) {
      return jsonError("Email or password is incorrect.", 401);
    }

    const response = NextResponse.json(publicUser(user));
    response.cookies.set(
      SESSION_COOKIE,
      createSessionToken(user._id.toString()),
      sessionCookieOptions(),
    );
    return response;
  } catch {
    return serverError();
  }
}
