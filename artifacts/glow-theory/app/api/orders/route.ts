import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { jsonError, serverError } from "@/lib/http";
import Order from "@/models/Order";

export const runtime = "nodejs";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId || !Types.ObjectId.isValid(userId)) {
    return jsonError("Sign in to view your orders.", 401);
  }

  try {
    await connectToDatabase();
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("items.product", "name image")
      .exec();

    return NextResponse.json(
      orders.map((order) => ({
        id: order._id.toString(),
        items: order.items.map((item) => {
          const product = item.product as unknown as
            | { _id: Types.ObjectId; name: string; image: string }
            | null;
          return {
            productId: product?._id.toString() ?? "",
            name: item.productName || product?.name || "Product no longer available",
            image: item.productImage || product?.image || "",
            quantity: item.quantity,
            price: Number(item.price.toFixed(3)),
          };
        }),
        total: Number(order.total.toFixed(3)),
        status: order.status,
        createdAt: order.createdAt.toISOString(),
      })),
    );
  } catch {
    return serverError();
  }
}
