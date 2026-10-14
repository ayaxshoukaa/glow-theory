import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { jsonError, publicUser, serverError } from "@/lib/http";
import User from "@/models/User";

export const runtime = "nodejs";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("Sign in to continue.", 401);

  try {
    await connectToDatabase();
    const user = await User.findById(userId).select("name email").exec();
    if (!user) return jsonError("Sign in to continue.", 401);
    return NextResponse.json(publicUser(user));
  } catch {
    return serverError();
  }
}
