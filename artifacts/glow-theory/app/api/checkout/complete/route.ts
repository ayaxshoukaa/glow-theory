import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { jsonError, serverError } from "@/lib/http";
import { getStripeClient } from "@/lib/stripe";
import Order from "@/models/Order";

export const runtime = "nodejs";

function stripeStatusCode(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "statusCode" in error) {
    const statusCode = error.statusCode;
    return typeof statusCode === "number" ? statusCode : undefined;
  }
  return undefined;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Checkout could not be verified.", 400);
  }

  const sessionId =
    body && typeof body === "object" && "sessionId" in body
      ? (body as { sessionId?: unknown }).sessionId
      : undefined;
  if (typeof sessionId !== "string" || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    return jsonError("Checkout could not be verified.", 400);
  }

  let stripe: ReturnType<typeof getStripeClient>;
  try {
    stripe = getStripeClient();
  } catch {
    return jsonError("Stripe test checkout is not configured yet.", 503);
  }

  try {
    let session: Awaited<ReturnType<typeof stripe.checkout.sessions.retrieve>>;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      const statusCode = stripeStatusCode(error);
      if (statusCode === 404) {
        return jsonError("Checkout session could not be found.", 404);
      }
      if (statusCode === 401 || statusCode === 403) {
        return jsonError("Stripe test credentials could not be authenticated.", 503);
      }
      return serverError();
    }

    const orderId = session.metadata?.orderId;
    const sessionCurrency = session.currency?.toUpperCase();
    if (
      session.mode !== "payment" ||
      session.payment_status !== "paid" ||
      (sessionCurrency !== "USD" && sessionCurrency !== "KWD") ||
      !orderId ||
      !Types.ObjectId.isValid(orderId)
    ) {
      return jsonError("This payment has not been completed.", 409);
    }

    await connectToDatabase();
    const order = await Order.findOne({
      _id: orderId,
      stripeSessionId: session.id,
    }).exec();
    const minorUnits = sessionCurrency === "KWD" ? 1000 : 100;
    if (
      !order ||
      order.currency !== sessionCurrency ||
      session.amount_total !== Math.round(order.total * minorUnits)
    ) {
      return jsonError("The paid order could not be matched.", 404);
    }

    if (order.status !== "paid") {
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;
      const shipping = session.collected_information?.shipping_details;
      order.status = "paid";
      order.customerEmail =
        session.customer_details?.email ?? session.customer_email ?? undefined;
      order.customerName =
        shipping?.name ?? session.customer_details?.name ?? undefined;
      order.shippingAddress = shipping?.address ?? undefined;
      order.stripePaymentIntentId = paymentIntentId ?? undefined;
      await order.save();
    }

    return NextResponse.json(
      {
        ok: true,
        order: {
          id: order._id.toString(),
          total: order.total,
          currency: order.currency,
          status: order.status,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return serverError();
  }
}
