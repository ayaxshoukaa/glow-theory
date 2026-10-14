import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST() {
  let userId: string | null;
  try {
    userId = await getSessionUserId();
  } catch {
    return jsonError("Session verification is unavailable.", 500);
  }

  if (!userId) {
    return jsonError("Sign in is required.", 401);
  }

  try {
    const mongoose = await connectToDatabase();
    const database = mongoose.connection.db;
    if (!database) throw new Error("Database connection is unavailable.");
    await database.command({ ping: 1 });

    return NextResponse.json(
      { ok: true, message: "MongoDB is responding." },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return jsonError("MongoDB could not be reached. Try again later.", 503);
  }
}
