const BASE = '/api/send-email';

async function callEmail(type, data) {
  try {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ...data }),
    });
    const json = await res.json().catch(() => ({}));
    return json.sent === true;
  } catch {
    return false;
  }
}

export const sendWelcomeEmail       = (name, email)            => callEmail('welcome', { name, email });
export const sendReceiptEmail       = (order)                  => callEmail('receipt', { order });
export const sendTrackingEmail      = (orderId, status)        => callEmail('order-update', { orderId, status });
export const sendForgotPassword     = (email, resetUrl)        => callEmail('forgot', { email, resetUrl });
export const sendBackInStockEmail   = (email, productName)     => callEmail('back-in-stock', { email, productName });
