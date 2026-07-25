// ── Vercel serverless function: POST /api/create-payment-intent ──
// This is what runs on the live (Vercel) site — Vercel does NOT run the
// always-on Express server in server.js. Both share lib/pricing.js so
// prices never drift between local and live.

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { CURRENCY, calculateAmount } = require('../lib/pricing');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { items } = req.body || {};
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

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      amount,
      currency: CURRENCY,
    });
  } catch (err) {
    console.error('PaymentIntent error:', err.message);
    res.status(400).json({ error: err.message });
  }
};
