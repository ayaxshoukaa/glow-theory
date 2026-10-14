import { NextResponse } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const response = new NextResponse(null, { status: 204 });
  response.cookies.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions(),
    expires: new Date(0),
    maxAge: 0,
  });
  return response;
}
