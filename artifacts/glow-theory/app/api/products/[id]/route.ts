import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { jsonError, serverError } from "@/lib/http";
import { serializeProduct } from "@/lib/products";
import Product from "@/models/Product";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!Types.ObjectId.isValid(id)) {
    return jsonError("Product not found.", 404);
  }

  try {
    await connectToDatabase();
    const product = await Product.findById(id).exec();
    if (!product) return jsonError("Product not found.", 404);
    return NextResponse.json(serializeProduct(product));
  } catch {
    return serverError();
  }
}
