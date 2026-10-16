import { Types } from "mongoose";
import type { ProductRecord } from "@/models/Product";
import { USD_CURRENCY, kwdToUsd } from "@/lib/currency";

type ProductDocumentLike = ProductRecord & { _id: Types.ObjectId };

export function serializeProduct(product: ProductDocumentLike) {
  return {
    id: product._id.toString(),
    name: product.name,
    description: product.description,
    price: kwdToUsd(product.price),
    currency: USD_CURRENCY,
    image: product.image,
    category: product.category,
    isBestseller: product.isBestseller,
    featured: product.featured,
    createdAt: product.createdAt.toISOString(),
  };
}
