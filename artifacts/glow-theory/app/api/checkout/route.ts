import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { jsonError, serverError } from "@/lib/http";
import { kwdToUsdCents } from "@/lib/currency";
import { getStripeClient } from "@/lib/stripe";
import Order from "@/models/Order";
import Product from "@/models/Product";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().regex(/^[a-f\d]{24}$/i),
        quantity: z.number().int().min(1).max(10),
      }),
    )
    .min(1)
    .max(12),
});

const USD_MINOR_UNITS = 100;

function stripeErrorDetails(error: unknown) {
  if (!error || typeof error !== "object") return {};

  const candidate = error as {
    type?: unknown;
    code?: unknown;
    param?: unknown;
    statusCode?: unknown;
  };

  return {
    ...(typeof candidate.type === "string" ? { type: candidate.type } : {}),
    ...(typeof candidate.code === "string" ? { code: candidate.code } : {}),
    ...(typeof candidate.param === "string" ? { param: candidate.param } : {}),
    ...(typeof candidate.statusCode === "number"
      ? { statusCode: candidate.statusCode }
      : {}),
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Your bag could not be read. Please try again.", 400);
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Your bag has invalid items. Refresh it and try again.", 400);
  }

  const quantities = new Map<string, number>();
  for (const item of parsed.data.items) {
    const nextQuantity = (quantities.get(item.productId) ?? 0) + item.quantity;
    if (nextQuantity > 10) {
      return jsonError("A maximum of 10 of each item can be checked out.", 400);
    }
    quantities.set(item.productId, nextQuantity);
  }

  let stripe: ReturnType<typeof getStripeClient>;
  try {
    stripe = getStripeClient();
  } catch {
    return jsonError("Stripe test checkout is not configured yet.", 503);
  }

  try {
    await connectToDatabase();

    const products = await Product.find({
      _id: { $in: [...quantities.keys()].map((id) => new Types.ObjectId(id)) },
    }).exec();
    const productsById = new Map(products.map((product) => [product._id.toString(), product]));

    if (productsById.size !== quantities.size) {
      return jsonError("Some items are no longer available. Refresh your bag and try again.", 409);
    }

    const orderId = new Types.ObjectId();
    const orderItems = [...quantities.entries()].map(([productId, quantity]) => {
      const product = productsById.get(productId);
      if (!product) throw new Error("Validated product disappeared.");

      const unitAmount = kwdToUsdCents(product.price);
      if (!Number.isSafeInteger(unitAmount) || unitAmount < 1) {
        throw new Error("A product has an invalid checkout price.");
      }

      return {
        product,
        quantity,
        unitAmount,
        price: unitAmount / USD_MINOR_UNITS,
      };
    });

    const totalMinor = orderItems.reduce(
      (total, item) => total + item.unitAmount * item.quantity,
      0,
    );
    const total = totalMinor / USD_MINOR_UNITS;
    const userId = await getSessionUserId();
    const userObjectId =
      userId && Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : undefined;
    const origin = new URL(request.url).origin;

    let session: Awaited<ReturnType<typeof stripe.checkout.sessions.create>>;
    try {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        client_reference_id: orderId.toString(),
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout/cancel`,
        shipping_address_collection: {
          allowed_countries: ["KW", "BH", "QA", "AE", "SA"],
        },
        line_items: orderItems.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: "usd",
            unit_amount: item.unitAmount,
            product_data: {
              name: item.product.name,
              description: item.product.description.slice(0, 500),
              metadata: { catalogProductId: item.product._id.toString() },
            },
          },
        })),
        metadata: { orderId: orderId.toString() },
        payment_intent_data: { metadata: { orderId: orderId.toString() } },
      });
    } catch (error) {
      const details = stripeErrorDetails(error);
      console.error("[checkout] Stripe session creation failed", details);

      if (details.param === "line_items[0][price_data][currency]") {
        return jsonError(
          "Stripe checkout is not enabled for USD on this account yet.",
          503,
        );
      }

      return serverError();
    }

    if (!session.url) {
      return jsonError("Secure checkout could not be started. Please try again.", 502);
    }

    try {
      await Order.create({
        _id: orderId,
        ...(userObjectId ? { user: userObjectId } : {}),
        items: orderItems.map((item) => ({
          product: item.product._id,
          productName: item.product.name,
          productImage: item.product.image,
          quantity: item.quantity,
          price: item.price,
        })),
        total,
        currency: "USD",
        status: "pending",
        stripeSessionId: session.id,
      });
    } catch {
      await stripe.checkout.sessions.expire(session.id).catch(() => undefined);
      return serverError();
    }

    return NextResponse.json(
      { url: session.url },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return serverError();
  }
}
