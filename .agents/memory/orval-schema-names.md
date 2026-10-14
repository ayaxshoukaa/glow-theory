---
name: OpenAPI codegen schema names
description: Avoid public export collisions between operation-derived Zod response schemas and component types.
---

Keep OpenAPI component schema names distinct from response-schema names inferred from operation IDs when Orval generates both shared Zod schemas and API client hooks. Build every package that consumes the generated shared package, not only the shared library typecheck.

**Why:** The Zod output and TypeScript type barrel can export the same public name, causing a real package build failure that a library-only typecheck may not catch.

**How to apply:** Use unique component schema names, run codegen, then build all consumers of generated schemas.
