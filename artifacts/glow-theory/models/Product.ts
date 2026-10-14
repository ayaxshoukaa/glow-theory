import mongoose, { type InferSchemaType } from "mongoose";

export const productCategories = [
  "Skincare",
  "Lip Care",
  "Body Care",
  "Gift Sets",
] as const;

const ProductSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    category: { type: String, enum: productCategories, required: true },
    isBestseller: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false, collection: "glow_theory_products" },
);

export type ProductRecord = InferSchemaType<typeof ProductSchema>;

const Product =
  (mongoose.models.Product as mongoose.Model<ProductRecord> | undefined) ??
  mongoose.model<ProductRecord>("Product", ProductSchema);

export default Product;
