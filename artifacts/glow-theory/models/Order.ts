import mongoose, { type InferSchemaType } from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
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
      required: true,
      index: true,
    },
    items: { type: [OrderItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false, collection: "glow_theory_orders" },
);

export type OrderRecord = InferSchemaType<typeof OrderSchema>;

const Order =
  (mongoose.models.Order as mongoose.Model<OrderRecord> | undefined) ??
  mongoose.model<OrderRecord>("Order", OrderSchema);

export default Order;
