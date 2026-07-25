// ── Diana Merch — Stripe backend ──
// Run:  npm install  &&  node server.js
// Requires a .env file (see .env.example) with your Stripe SECRET key.

const path = require('path');
const express = require('express');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Shared, server-authoritative pricing — same module the Vercel serverless
// function uses, so prices never drift between local and live.
const { CURRENCY, calculateAmount } = require('./lib/pricing');

const app = express();
app.use(express.json());

// Serve the static site (index.html, merch.html, images, music…)
app.use(express.static(__dirname));

// ── Create a PaymentIntent for the current cart ──
// Path matches the Vercel serverless function (api/create-payment-intent.js)
// so the frontend uses one URL in both local and live environments.
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { items } = req.body;
    const amount = calculateAmount(items);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: CURRENCY,
      automatic_payment_methods: { enabled: true },
      metadata: {
        cart: JSON.stringify(
          items.map(i => `${i.id}${i.size ? ':' + i.size : ''} x${i.qty}`)
        ).slice(0, 490),
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount,
      currency: CURRENCY,
    });
  } catch (err) {
    console.error('PaymentIntent error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Simple success landing page (Stripe redirects here after payment)
app.get('/success', (req, res) => {
  res.send(`<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Thank you — Diana</title>
    <style>
      body{font-family:'Helvetica Neue',Arial,sans-serif;background:#F9F9F8;color:#111;
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        height:100vh;margin:0;text-align:center;}
      h1{font-family:Georgia,serif;font-size:42px;letter-spacing:-0.01em;margin:0 0 12px;}
      p{color:#7A7A7A;letter-spacing:0.1em;font-size:13px;}
      a{margin-top:32px;color:#fff;background:#3B6FD4;text-decoration:none;
        padding:14px 36px;font-size:11px;letter-spacing:0.24em;text-transform:uppercase;}
    </style></head><body>
      <h1>Thank you.</h1>
      <p>Your order is confirmed — a receipt is on its way.</p>
      <a href="/merch.html">Back to shop</a>
    </body></html>`);
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log(`\n  Diana Merch running → http://localhost:${PORT}/merch.html\n`);
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('  ⚠  STRIPE_SECRET_KEY is not set. Copy .env.example to .env and add your key.\n');
  }
});
