import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { jsonError, serverError } from "@/lib/http";
import { serializeProduct } from "@/lib/products";
import Product, { productCategories } from "@/models/Product";

export const runtime = "nodejs";

const querySchema = z.object({
  search: z.string().trim().max(100).optional(),
  category: z.enum(productCategories).optional(),
  maxPrice: z.coerce.number().min(0).max(100_000).optional(),
  sort: z.enum(["featured", "price-asc", "price-desc", "name"]).default("featured"),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  const parsed = querySchema.safeParse(params);
  if (!parsed.success) {
    return jsonError("Check the product filters and try again.", 400);
  }

  try {
    await connectToDatabase();

    const filter: Record<string, unknown> = {};
    if (parsed.data.category) filter.category = parsed.data.category;
    if (parsed.data.maxPrice !== undefined) {
      filter.price = { $lte: parsed.data.maxPrice };
    }
    if (parsed.data.search) {
      const escaped = parsed.data.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
      ];
    }

    const sort: Record<string, 1 | -1> =
      parsed.data.sort === "price-asc"
        ? { price: 1 as const, name: 1 as const }
        : parsed.data.sort === "price-desc"
          ? { price: -1 as const, name: 1 as const }
          : parsed.data.sort === "name"
            ? { name: 1 as const }
            : { featured: -1 as const, isBestseller: -1 as const, createdAt: -1 as const };

    const products = await Product.find(filter).sort(sort).exec();
    return NextResponse.json(products.map(serializeProduct));
  } catch {
    return serverError();
  }
}
