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
any postcode. On success you're redirected to `/success`.

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

- **`server.js`** exposes `POST /create-payment-intent`. The browser sends only
  the cart contents (product id, size, qty); the **server** looks up prices and
  computes the amount — the client never dictates the price. Currency is **GBP**.
- **`merch.html`** calls that endpoint on Checkout, initialises Stripe Elements
  with the returned `clientSecret`, and mounts the Payment Element inline in the
  lavender (`#F0EFFE`) checkout area of the cart panel.

## Going live (later)

- Swap test keys for live keys.
- Add a [webhook](https://stripe.com/docs/payments/handling-payment-events) on
  `payment_intent.succeeded` to fulfil orders — don't rely on the redirect alone.
