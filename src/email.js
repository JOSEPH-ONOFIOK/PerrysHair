const BASE = '/api/send-email';

async function callEmail(type, data) {
  try {
    await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ...data }),
    });
  } catch (err) {
    console.error(`[email] ${type} failed:`, err?.message ?? err);
  }
}

export const sendWelcomeEmail    = (name, email)       => callEmail('welcome', { name, email });
export const sendReceiptEmail    = (order)             => callEmail('receipt', { order });
export const sendTrackingEmail   = (order, status)     => callEmail('order-update', { order, status });
export const sendForgotPassword  = (email, resetUrl)   => callEmail('forgot', { email, resetUrl });
