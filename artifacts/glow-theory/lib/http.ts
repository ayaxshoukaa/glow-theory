import { NextResponse } from "next/server";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function serverError() {
  return jsonError("Something went wrong. Please try again.", 500);
}

export function publicUser(user: {
  _id: { toString(): string };
  name: string;
  email: string;
}) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
}
