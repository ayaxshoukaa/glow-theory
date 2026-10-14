import { connectToDatabase } from "@/lib/db";
import { SEED_PRODUCTS } from "@/lib/seed-data";
import Product from "@/models/Product";

async function seedProducts() {
  await connectToDatabase();

  let added = 0;
  let alreadyPresent = 0;

  for (const product of SEED_PRODUCTS) {
    const result = await Product.updateOne(
      { slug: product.slug },
      { $setOnInsert: product },
      { upsert: true },
    );
    if (result.upsertedCount > 0) added += 1;
    else alreadyPresent += 1;
  }

  process.stdout.write(
    `Glow Theory catalog ready: ${added} added, ${alreadyPresent} already present.\n`,
  );
}

seedProducts()
  .then(async () => {
    const mongoose = await import("mongoose");
    await mongoose.default.disconnect();
  })
  .catch(async (error: unknown) => {
    const errorType =
      error instanceof Error && /^[A-Za-z]+$/.test(error.name)
        ? error.name
        : "UnknownError";
    const safeCode =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code === "number"
        ? ` code ${error.code}`
        : "";
    const safeCodeName =
      typeof error === "object" &&
      error !== null &&
      "codeName" in error &&
      typeof error.codeName === "string" &&
      /^[A-Za-z]+$/.test(error.codeName)
        ? ` ${error.codeName}`
        : "";
    const safeMessage = error instanceof Error ? error.message.toLowerCase() : "";
    const likelyCause =
      /auth|credential/.test(safeMessage)
        ? "Atlas rejected the database user's authentication"
        : /ip|access list|whitelist|network/.test(safeMessage)
          ? "Atlas network access may be blocking this app"
          : /not authorized|permission/.test(safeMessage)
            ? "the Atlas database user may lack database permissions"
            : "check Atlas network access, database-user permissions, and MONGODB_URI";
    process.stderr.write(
      `Could not seed the Glow Theory catalog (${errorType}${safeCode}${safeCodeName}); ${likelyCause}.\n`,
    );
    const mongoose = await import("mongoose");
    await mongoose.default.disconnect().catch(() => undefined);
    process.exitCode = 1;
  });
