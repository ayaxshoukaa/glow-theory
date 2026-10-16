---
name: Glow Theory currency policy
description: Storefront and hosted Checkout use USD converted from KWD-denominated catalog values.
---

The owner chose USD storefront prices and Stripe-hosted checkout, converting existing KWD catalog values at approximately 3.21 USD per KWD and rounding to cents. Do not simply relabel KWD values as USD. Keep original MongoDB base prices intact unless the owner separately asks to rewrite them.

**Why:** Stripe rejected KWD on the connected account, and the owner explicitly chose USD conversion at the quoted rate.

**How to apply:** Keep product display, price filters, cart totals, and Stripe amounts consistent with the approved conversion. Ask before changing the conversion rate or rewriting the stored KWD base values.
