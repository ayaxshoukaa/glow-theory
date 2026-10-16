---
name: Glow Theory currency policy
description: The storefront should remain priced and charged in Kuwaiti dinars unless the owner explicitly chooses a different currency.
---

Keep Glow Theory product prices and Stripe-hosted checkout in KWD. Do not silently switch to USD or another supported currency. The Stripe account must be enabled to accept KWD before checkout can complete.

**Why:** The owner explicitly chose to keep KWD after Stripe rejected a test Checkout Session because the account did not support KWD.

**How to apply:** If Stripe rejects KWD, guide the owner to enable KWD settlement with a matching supported bank account in Stripe, then retest. Only change storefront pricing or charge currency after the owner explicitly approves the change.
