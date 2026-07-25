# Diana — Merch Store

Artist site with a Stripe-powered merch store. The Stripe **Payment Element**
is embedded directly in the slide-out cart, so payment fields appear inline when
**Checkout** is clicked.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Add your Stripe TEST keys** (https://dashboard.stripe.com/test/apikeys)

   - Copy `.env.example` → `.env` and set your **secret** key:
     ```
     STRIPE_SECRET_KEY=sk_test_...
     ```
   - In `merch.html`, set your **publishable** key:
     ```js
     const STRIPE_PUBLISHABLE_KEY = 'pk_test_...';
     ```

3. **Run**
   ```bash
   npm start
   ```
   Open http://localhost:4242/merch.html

## Test card

Use Stripe's test card: `4242 4242 4242 4242`, any future expiry, any CVC,
any postcode. On success you're redirected to `success.html`.

## Running detached (no terminal needed)

This is a temporary test project, so instead of a process manager, the server
can be launched as its own independent process — closing the terminal (or
VS Code) won't stop it. It will **not** survive a reboot; run the start
command again after restarting your PC.

**Start (detached):**
```powershell
Start-Process node -ArgumentList "server.js" -WorkingDirectory "c:\Users\luisl\Desktop\project26\jobescape\VS Code-Claude\WebProjects\Diana-Music-Merch" -WindowStyle Hidden
```

**Check it's running (port 4242):**
```powershell
Get-NetTCPConnection -LocalPort 4242 -ErrorAction SilentlyContinue
```

**Stop it (targeted — only the process on port 4242, safe if other node
projects are running elsewhere):**
```powershell
Get-NetTCPConnection -LocalPort 4242 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

## How it works

The checkout endpoint is `POST /api/create-payment-intent`. The browser sends
only the cart contents (product id, size, qty); the **server** looks up prices
and computes the amount — the client never dictates the price. Currency is
**GBP**.

- **`lib/pricing.js`** — the single source of truth for prices and the
  amount calculation. Imported by both the local server and the live function,
  so prices can never drift between the two.
- **`server.js`** — the local Express server (used for `npm start` /
  `localhost`). Serves the static site and the checkout endpoint.
- **`api/create-payment-intent.js`** — the Vercel serverless function that
  runs the checkout endpoint on the live site. Vercel does **not** run
  `server.js`; it serves the static files and this function.
- **`merch.html`** calls the endpoint on Checkout, initialises Stripe Elements
  with the returned `clientSecret`, and mounts the Payment Element inline in the
  lavender (`#F0EFFE`) checkout area of the cart panel.

## Deploying (Vercel via GitHub)

The live site is deployed by pushing to GitHub — Vercel auto-builds from the
connected repo. The same code runs both locally and live; no per-environment
changes are needed **except one**:

> **Set `STRIPE_SECRET_KEY` in Vercel's Environment Variables.**
> `.env` is gitignored (correctly — it holds your secret key), so it does not
> travel with the push. Without this variable set in Vercel, the live checkout
> function will fail. Add it under Vercel → Project → Settings →
> Environment Variables, using the same `sk_test_...` value from your `.env`.

## Going live for real money (later)

- Swap **test** keys for **live** keys (both `.env` / Vercel var **and** the
  publishable key in `merch.html`).
- Add a [webhook](https://stripe.com/docs/payments/handling-payment-events) on
  `payment_intent.succeeded` to fulfil orders — don't rely on the redirect alone.
