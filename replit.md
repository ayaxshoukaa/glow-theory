# Glow Theory

A responsive skincare and self-care shop for teens and young adults, built around the slogan “Your Glow, Your Rules.”

## Run & Operate

- `pnpm --filter @workspace/glow-theory run dev` — run the Glow Theory Next.js website
- `pnpm --filter @workspace/glow-theory run seed` — add missing sample catalog products to MongoDB
- `pnpm --filter @workspace/glow-theory run typecheck` — check the website TypeScript
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required website secrets: `MONGODB_URI` and `JWT_SECRET` in Replit Secrets
- The separate scaffolded API Server and PostgreSQL package are not used by the Glow Theory shop.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Website: Next.js App Router, TypeScript, Tailwind CSS
- Shop API: Next.js route handlers, Mongoose, MongoDB Atlas
- Account sessions: bcryptjs password hashes and signed httpOnly JWT cookies
- API contract/codegen: OpenAPI and Orval
- Cart and wishlist: browser localStorage
- Checkout, contact, and newsletter: clearly labeled demo flows; no real payments or message delivery

## Where things live

- `artifacts/glow-theory/app/` — storefront pages and Next.js API routes
- `artifacts/glow-theory/components/` — shared shop UI
- `artifacts/glow-theory/models/` — MongoDB User, Product, and Order models
- `artifacts/glow-theory/lib/db.ts` — cached server-side MongoDB connection
- `artifacts/glow-theory/lib/seed-data.ts` — sample catalog source for the idempotent seed script
- `lib/api-spec/openapi.yaml` — generated API client contract

## Architecture decisions

- Keep the app's MongoDB collections namespaced (`glow_theory_*`) so they do not collide with unrelated collections in the existing Atlas database.
- The shared API artifact already owns `/api`; the website calls `/shop-api`, which Next.js rewrites internally to its `app/api` handlers.
- Product catalog data is read from MongoDB. Cart and wishlist stay on the device and are not submitted as orders.
- Demo checkout never requests payment details or creates a real order.

## Product

Glow Theory includes product discovery, product details and quick view, search/filter/sort, a preference-based product quiz, cart and wishlist, customer signup/login, protected order history, and local demo-only contact/newsletter/checkout forms.

## User preferences

- Follow the attached Glow Theory requirements, including the blush/cream/mocha palette and Playfair Display/Poppins typography.
- Keep all database credentials server-side in Replit Secrets; never put them in source code, logs, or client bundles.

## Gotchas

- Add `MONGODB_URI` and a long random `JWT_SECRET` to Replit Secrets before using database-backed routes or the seed command.
- Seed inserts only missing Glow Theory products; it does not replace existing catalog entries.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
