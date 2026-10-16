---
name: Multi-artifact preview routing
description: How to avoid misleading requests when testing APIs in this multi-artifact workspace.
---

When checking the Glow Theory Next.js API locally, target the web workflow's resolved port rather than assuming the shared root proxy routes to the web artifact. The API Server artifact also owns a root path, so requests sent to `localhost:80` can reach that service and return Express 404s even while the web preview is healthy.

**Why:** A shared-root curl reached the separate API Server while the screenshot tool correctly selected the Glow Theory artifact. This created false API failures during checkout verification.

**How to apply:** Check the running web workflow logs for its current local port, then call that port directly for Next.js API tests. Use artifact-aware preview screenshots for visual checks.
