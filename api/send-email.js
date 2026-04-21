import nodemailer from 'nodemailer';

async function fetchOrderById(orderId) {
  const base = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!base || !key) return null;
  try {
    const res = await fetch(
      `${base}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&select=*,order_items(*)`,
      { headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' } }
    );
    const rows = await res.json();
    const data = Array.isArray(rows) ? rows[0] : null;
    if (!data) return null;
    return {
      id: data.id,
      date: data.date,
      total: data.total,
      status: data.status,
      delivery: data.delivery,
      tracking: data.tracking,
      customer: { name: data.customer_name, email: data.customer_email },
      items: (data.order_items || []).map((i) => ({
        name: i.product_name,
        price: i.product_price,
        qty: i.qty,
      })),
    };
  } catch {
    return null;
  }
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const FROM = `"Perry's Hairline" <${process.env.GMAIL_USER}>`;

// Escape user-supplied strings before injecting into HTML
const esc = (s) => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

const ORDER_STATUSES = [
  'Order Placed', 'Payment Confirmed', 'Processing',
  'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled',
];

const fmt = (n) => `₦${Number(n).toLocaleString()}`;

// ── Shared layout ─────────────────────────────────────────────────────────────
const wrap = (content) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9f0f4;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f0f4;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08)">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#3d1f1f,#6b3030);padding:32px 40px;text-align:center">
          <div style="font-size:22px;color:#C9973A;letter-spacing:2px;font-weight:900">✦ PERRYS HAIRLINE</div>
          <div style="font-size:12px;color:#e8cfc0;margin-top:4px;letter-spacing:1px">CROWN YOUR LOOK EVERY DAY</div>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:36px 40px">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#fdf0f5;padding:24px 40px;text-align:center;border-top:1px solid #f0dde6">
          <p style="margin:0;font-size:12px;color:#999">© ${new Date().getFullYear()} Perry's Hairline. All rights reserved.</p>
          <p style="margin:8px 0 0;font-size:12px;color:#bbb">You received this email because you have an account with us.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const btn = (text, url) =>
  `<a href="${url}" style="display:inline-block;background:#C9973A;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;margin:20px 0">${text}</a>`;

const h1 = (text) =>
  `<h1 style="font-size:26px;color:#3d1f1f;margin:0 0 16px;font-weight:900">${text}</h1>`;

const p = (text) =>
  `<p style="font-size:15px;color:#555;line-height:1.8;margin:0 0 12px">${text}</p>`;

// ── Email builders ─────────────────────────────────────────────────────────────

function welcomeEmail({ name, email }) {
  const safeName = esc(name) || 'Beautiful';
  return {
    to: email,
    subject: `Welcome to Perry's Hairline, ${safeName}! 🌸`,
    html: wrap(`
      ${h1(`Welcome, ${safeName}! 🌸`)}
      ${p("We're so glad you joined the Perry's Hairline family. Your next crown is just a few clicks away.")}
      ${p('Browse our collection of premium human hair wigs, lace fronts, and more — crafted to make you look and feel incredible.')}
      <div style="text-align:center">${btn('Start Shopping', process.env.APP_URL || 'https://perrys-hair.vercel.app')}</div>
      ${p("If you have any questions, just reply to this email — we're always here to help.")}
      <p style="font-size:14px;color:#C9973A;font-weight:700;margin:16px 0 0">With love,<br>The Perry's Hairline Team ✦</p>
    `),
  };
}

function forgotPasswordEmail({ email, resetUrl }) {
  return {
    to: email,
    subject: "Reset your Perry's Hairline password",
    html: wrap(`
      ${h1('Reset Your Password 🔐')}
      ${p("We received a request to reset your password. Click the button below — this link expires in 1 hour.")}
      <div style="text-align:center">${btn('Reset My Password', resetUrl)}</div>
      ${p("If you didn't request this, you can safely ignore this email. Your password won't change.")}
      <div style="background:#fdf0f5;border-radius:8px;padding:14px 18px;margin-top:16px">
        <p style="font-size:12px;color:#999;margin:0">If the button doesn't work, copy this link:<br>
        <a href="${resetUrl}" style="color:#C9973A;word-break:break-all;font-size:12px">${resetUrl}</a></p>
      </div>
    `),
  };
}

function orderReceiptEmail({ order }) {
  const items = (order.items || []).map((i) =>
    `<tr>
      <td style="padding:10px 0;border-bottom:1px solid #f5e8ee;font-size:14px;color:#333">${esc(i.name)} × ${Number(i.qty)}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f5e8ee;font-size:14px;color:#333;text-align:right;font-weight:700">${fmt(i.price * i.qty)}</td>
    </tr>`
  ).join('');

  const custName = esc(order.customer?.name) || 'there';
  const custAddress = esc(order.customer?.address);
  const custCity = esc(order.customer?.city);

  return {
    to: order.customer?.email,
    subject: `Order Confirmed — ${esc(order.id)} 🎉`,
    html: wrap(`
      ${h1('Your Order is Confirmed! 🎉')}
      ${p(`Hi ${custName}, thank you for your order! We've received it and will start processing right away.`)}
      <div style="background:#fdf0f5;border-radius:10px;padding:20px 24px;margin:20px 0">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:13px;color:#999">Order ID</td>
            <td style="font-size:13px;color:#3d1f1f;font-weight:700;text-align:right">${esc(order.id)}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#999;padding-top:6px">Tracking</td>
            <td style="font-size:13px;color:#C9973A;font-weight:700;text-align:right;padding-top:6px">${esc(order.tracking)}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#999;padding-top:6px">Delivery</td>
            <td style="font-size:13px;color:#3d1f1f;text-align:right;padding-top:6px;text-transform:capitalize">${esc(order.delivery)}</td>
          </tr>
        </table>
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0">
        ${items}
        <tr>
          <td style="padding-top:14px;font-size:16px;font-weight:900;color:#3d1f1f">Total</td>
          <td style="padding-top:14px;font-size:16px;font-weight:900;color:#C9973A;text-align:right">${fmt(order.total)}</td>
        </tr>
      </table>
      ${custAddress ? `${p(`<strong>Delivering to:</strong> ${custAddress}, ${custCity}`)}` : ''}
      ${p("We'll send you another email as soon as your order ships. Track your order anytime from your account.")}
    `),
  };
}

function orderUpdateEmail({ order, status }) {
  const statusIndex = typeof status === 'number' ? status : ORDER_STATUSES.indexOf(status);
  const statusLabel = ORDER_STATUSES[statusIndex] || 'Updated';
  const isCancelled = statusIndex === 6;

  // Progress steps — show all 6 delivery steps (skip Cancelled in the tracker)
  const steps = ORDER_STATUSES.slice(0, 6).map((s, i) => {
    const done = !isCancelled && i <= statusIndex;
    const active = !isCancelled && i === statusIndex;
    return `<tr>
      <td style="padding:8px 0;vertical-align:middle">
        <span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:${done ? '#C9973A' : '#eee'};color:${done ? '#fff' : '#bbb'};font-size:11px;font-weight:700;text-align:center;line-height:22px;margin-right:12px">${done ? '✓' : (i + 1)}</span>
        <span style="font-size:14px;color:${active ? '#C9973A' : done ? '#3d1f1f' : '#bbb'};font-weight:${active ? '700' : '400'}">${esc(s)}${active ? ' &larr; Now' : ''}</span>
      </td>
    </tr>`;
  }).join('');

  // Order items summary
  const itemRows = (order.items || []).map((i) =>
    `<tr>
      <td style="padding:8px 0;border-bottom:1px solid #f5e8ee;font-size:14px;color:#333">${esc(i.name)} × ${Number(i.qty)}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f5e8ee;font-size:14px;color:#333;text-align:right;font-weight:700">₦${Number(i.price * i.qty).toLocaleString()}</td>
    </tr>`
  ).join('');

  const custName = esc(order.customer?.name) || 'there';
  const custAddress = [order.customer?.address, order.customer?.city, order.customer?.state].filter(Boolean).map(esc).join(', ');

  const statusMessages = {
    0: 'We have received your order and are getting it ready.',
    1: 'Your payment has been confirmed. ',
    2: "We're carefully preparing your order for dispatch.",
    3: "Great news — your order is on its way!",
    4: "Your order is out for delivery today. Stay close!",
    5: "Your order has been delivered. We hope you love it! 💛",
    6: "Your order has been cancelled. If this was a mistake, please contact us.",
  };

  return {
    to: order.customer?.email,
    subject: isCancelled
      ? `Order Cancelled — ${esc(order.id)}`
      : `Order Update: ${statusLabel} — ${esc(order.id)}`,
    html: wrap(`
      ${h1(isCancelled ? 'Order Cancelled' : `Update: ${statusLabel} 📦`)}
      ${p(`Hi ${custName}, ${statusMessages[statusIndex] || "here's an update on your order."}`)}

      <div style="background:#fdf0f5;border-radius:10px;padding:16px 20px;margin:20px 0">
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px">
          <tr>
            <td style="font-size:12px;color:#999">Order ID</td>
            <td style="font-size:13px;color:#3d1f1f;font-weight:700;text-align:right">${esc(order.id)}</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:#999;padding-top:4px">Tracking No.</td>
            <td style="font-size:13px;color:#C9973A;font-weight:700;text-align:right;padding-top:4px">${esc(order.tracking)}</td>
          </tr>
          ${custAddress ? `<tr><td style="font-size:12px;color:#999;padding-top:4px">Delivering to</td><td style="font-size:13px;color:#3d1f1f;text-align:right;padding-top:4px">${custAddress}</td></tr>` : ''}
        </table>
      </div>

      ${itemRows ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0">
        ${itemRows}
        <tr>
          <td style="padding-top:12px;font-size:15px;font-weight:900;color:#3d1f1f">Order Total</td>
          <td style="padding-top:12px;font-size:15px;font-weight:900;color:#C9973A;text-align:right">₦${Number(order.total).toLocaleString()}</td>
        </tr>
      </table>` : ''}

      ${!isCancelled ? `<div style="background:#fff8f0;border-radius:10px;padding:16px 20px;margin:20px 0">
        <p style="font-size:12px;color:#999;margin:0 0 10px;text-transform:uppercase;letter-spacing:1px">Delivery Progress</p>
        <table width="100%" cellpadding="0" cellspacing="0">${steps}</table>
      </div>` : ''}

      <div style="text-align:center">${btn('Track My Order', (process.env.APP_URL || 'https://perrys-hair.vercel.app') + '?view=orders')}</div>
      ${p("Thank you for shopping with Perry's Hairline! 💛")}
    `),
  };
}


function backInStockEmail({ email, productName }) {
  const safeName = esc(productName);
  return {
    to: email,
    subject: `${safeName} is back in stock! 🎉`,
    html: wrap(`
      ${h1('Good news — it\'s back! 🎉')}
      ${p(`The <strong>${safeName}</strong> you saved is back in stock. Grab it before it sells out again!`)}
      <div style="text-align:center">${btn('Shop Now', process.env.APP_URL || 'https://perrys-hair.vercel.app')}</div>
      ${p('Stock is limited — act fast!')}
    `),
  };
}

function adminNewOrderEmail({ order }) {
  const items = (order.items || []).map((i) =>
    `<tr>
      <td style="padding:10px 0;border-bottom:1px solid #f5e8ee;font-size:14px;color:#333">${esc(i.name)}${i.capSize ? ` <span style="color:#C9973A;font-size:12px">(Cap: ${esc(i.capSize)})</span>` : ''} × ${Number(i.qty)}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f5e8ee;font-size:14px;color:#333;text-align:right;font-weight:700">${fmt(i.price * i.qty)}</td>
    </tr>`
  ).join('');

  const custName = esc(order.customer?.name) || 'Guest';
  const custEmail = esc(order.customer?.email) || '—';
  const custPhone = esc(order.customer?.phone) || '—';
  const custAddress = [order.customer?.address, order.customer?.city, order.customer?.state].filter(Boolean).map(esc).join(', ') || '—';

  return {
    to: 'josephonofiok08@gmail.com',
    cc: 'hairlinebyperry@gmail.com',
    subject: `🛍️ New Order — ${esc(order.id)} (${fmt(order.total)})`,
    html: wrap(`
      ${h1('New Order Received! 🛍️')}
      ${p(`A new order has just been placed on Perry's Hairline.`)}

      <div style="background:#fdf0f5;border-radius:10px;padding:20px 24px;margin:20px 0">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="font-size:12px;color:#999;padding-bottom:6px">Order ID</td><td style="font-size:13px;color:#3d1f1f;font-weight:700;text-align:right">${esc(order.id)}</td></tr>
          <tr><td style="font-size:12px;color:#999;padding-bottom:6px">Date</td><td style="font-size:13px;color:#3d1f1f;text-align:right">${esc(order.date)}</td></tr>
          <tr><td style="font-size:12px;color:#999;padding-bottom:6px">Delivery Zone</td><td style="font-size:13px;color:#3d1f1f;text-align:right;text-transform:capitalize">${esc(order.delivery)}</td></tr>
          <tr><td style="font-size:12px;color:#999;padding-bottom:6px">Customer</td><td style="font-size:13px;color:#3d1f1f;font-weight:700;text-align:right">${custName}</td></tr>
          <tr><td style="font-size:12px;color:#999;padding-bottom:6px">Email</td><td style="font-size:13px;color:#C9973A;text-align:right">${custEmail}</td></tr>
          <tr><td style="font-size:12px;color:#999;padding-bottom:6px">Phone</td><td style="font-size:13px;color:#3d1f1f;text-align:right">${custPhone}</td></tr>
          <tr><td style="font-size:12px;color:#999">Address</td><td style="font-size:13px;color:#3d1f1f;text-align:right">${custAddress}</td></tr>
        </table>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0">
        <tr>
          <td style="font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px">Items</td>
          <td style="font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;text-align:right">Amount</td>
        </tr>
        ${items}
        <tr>
          <td style="padding-top:14px;font-size:17px;font-weight:900;color:#3d1f1f">Order Total</td>
          <td style="padding-top:14px;font-size:17px;font-weight:900;color:#C9973A;text-align:right">${fmt(order.total)}</td>
        </tr>
      </table>

      <div style="text-align:center">${btn('View in Admin Dashboard', (process.env.APP_URL || 'https://perrys-hair.vercel.app') + '?view=admin')}</div>
    `),
  };
}

function cartReminderEmail({ name, email, items }) {
  const safeName = esc(name) || 'beautiful';
  const inStock = items.filter((i) => i.in_stock !== false);
  const outOfStock = items.filter((i) => i.in_stock === false);

  const itemList = (list) => list.map((i) =>
    `<tr>
      <td style="padding:8px 0;font-size:14px;color:#333;border-bottom:1px solid #f5e8ee">${esc(i.product_name)}</td>
      <td style="padding:8px 0;font-size:14px;color:#C9973A;font-weight:700;text-align:right;border-bottom:1px solid #f5e8ee">${fmt(i.product_price)}</td>
    </tr>`
  ).join('');

  const outOfStockSection = outOfStock.length ? `
    <div style="background:#fff8f0;border-radius:8px;padding:14px 18px;margin:16px 0">
      <p style="font-size:13px;color:#856404;font-weight:700;margin:0 0 8px">⚠️ These items are currently out of stock:</p>
      <table width="100%" cellpadding="0" cellspacing="0">${itemList(outOfStock)}</table>
      <p style="font-size:12px;color:#999;margin:8px 0 0">We'll email you as soon as they're available again.</p>
    </div>` : '';

  return {
    to: email,
    subject: `You left something behind, ${safeName} 👀`,
    html: wrap(`
      ${h1('Your cart misses you! 💛')}
      ${p(`Hi ${safeName}, you left some gorgeous pieces in your cart. Don't let them get away!`)}
      ${inStock.length ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0">${itemList(inStock)}</table>` : ''}
      ${outOfStockSection}
      ${inStock.length ? `<div style="text-align:center">${btn('Complete My Order', process.env.APP_URL || 'https://perrys-hair.vercel.app')}</div>` : ''}
      ${p('Stock is limited — these beauties might not last long.')}
    `),
  };
}

// ── Rate limiting ──────────────────────────────────────────────────────────────
const rateLimitMap = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.reset) { rateLimitMap.set(ip, { count: 1, reset: now + 60_000 }); return false; }
  if (entry.count >= 10) return true;
  entry.count++;
  return false;
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const ip = req.headers['x-forwarded-for'] || 'unknown';
  if (isRateLimited(ip)) return res.status(429).json({ error: 'Too many requests' });

  const { type, ...data } = req.body;

  try {
    let config;
    if (type === 'welcome')          config = welcomeEmail(data);
    else if (type === 'forgot')      config = forgotPasswordEmail(data);
    else if (type === 'receipt')     config = orderReceiptEmail(data);
    else if (type === 'order-update') {
      const freshOrder = await fetchOrderById(data.orderId);
      if (!freshOrder) return res.status(404).json({ error: 'Order not found' });
      config = orderUpdateEmail({ order: freshOrder, status: data.status });
    }
    else if (type === 'cart-reminder')  config = cartReminderEmail(data);
    else if (type === 'back-in-stock')  config = backInStockEmail(data);
    else if (type === 'admin-new-order') config = adminNewOrderEmail(data);
    else return res.status(400).json({ error: 'Unknown email type' });

    if (!config.to) return res.status(400).json({ error: 'No recipient email' });

    // Validate recipient is a real email address before sending
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.to))
      return res.status(400).json({ error: 'Invalid recipient email' });

    await transporter.sendMail({ from: FROM, ...config });
    res.json({ sent: true });
  } catch (err) {
    console.error('[send-email] error:', err?.message || err);
    res.status(500).json({ error: 'Failed to send email', detail: err?.message });
  }
}
