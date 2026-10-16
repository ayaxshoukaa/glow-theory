import mongoose, { type InferSchemaType } from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: { type: String, required: true },
    productImage: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    items: { type: [OrderItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ["KWD"], default: "KWD", required: true },
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
      required: true,
    },
    stripeSessionId: { type: String, unique: true, sparse: true },
    stripePaymentIntentId: { type: String },
    customerEmail: { type: String },
    customerName: { type: String },
    shippingAddress: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false, collection: "glow_theory_orders" },
);

export type OrderRecord = InferSchemaType<typeof OrderSchema>;

const Order =
  (mongoose.models.Order as mongoose.Model<OrderRecord> | undefined) ??
  mongoose.model<OrderRecord>("Order", OrderSchema);

export default Order;
