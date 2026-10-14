---
name: Next.js Replit runtime boundaries
description: Shared server helpers, standalone seed scripts, and Replit proxy hosts in this Next.js artifact.
---

Keep MongoDB and authentication helpers out of client imports, but do not add the `server-only` package marker to modules imported by the standalone `tsx` seed script: that package intentionally throws outside the Next.js React Server Component runtime.

**Why:** The seed CLI uses the same database helper as API routes, and failed before connecting when the marker was present.

**How to apply:** Keep DB/auth imports confined to API route or server modules; if `server-only` is needed, split CLI-safe database code from RSC-only modules.

For Next.js development previews in Replit, allow both nested `*.pike.replit.dev` hosts and `127.0.0.1` in `allowedDevOrigins`; the generic `*.replit.dev` entry did not cover the proxy host used by the preview and HMR was blocked.

**Why:** The proxied preview uses a nested `pike.replit.dev` host while local screenshot capture connects through `127.0.0.1`.

**How to apply:** If a page renders only its loading state or HMR reports blocked cross-origin resources, inspect the exact host in workflow logs and add the appropriate development host pattern before changing app code.
