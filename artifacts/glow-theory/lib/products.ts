import { Types } from "mongoose";
import type { ProductRecord } from "@/models/Product";

type ProductDocumentLike = ProductRecord & { _id: Types.ObjectId };

export function serializeProduct(product: ProductDocumentLike) {
  return {
    id: product._id.toString(),
    name: product.name,
    description: product.description,
    price: Number(product.price.toFixed(3)),
    image: product.image,
    category: product.category,
    isBestseller: product.isBestseller,
    featured: product.featured,
    createdAt: product.createdAt.toISOString(),
  };
}
