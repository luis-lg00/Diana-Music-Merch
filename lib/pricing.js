// ── Shared, server-authoritative pricing ──
// Single source of truth for prices, imported by BOTH the local Express
// server (server.js) and the Vercel serverless function (api/…).
// NEVER trust amounts sent from the browser — the client tells us *what*
// is in the cart; the server decides what it *costs*.

const PRICES = {
  tshirt: 3500, // £35.00
  hoodie: 6500, // £65.00
  vinyl:  3000, // £30.00
  poster: 2000, // £20.00
  hat:    100,  // £1.00
};

const CURRENCY = 'gbp';

function calculateAmount(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Cart is empty.');
  }
  return items.reduce((total, item) => {
    const unit = PRICES[item.id];
    if (unit === undefined) throw new Error(`Unknown product: ${item.id}`);
    const qty = Math.max(1, Math.min(99, parseInt(item.qty, 10) || 1));
    return total + unit * qty;
  }, 0);
}

module.exports = { PRICES, CURRENCY, calculateAmount };
