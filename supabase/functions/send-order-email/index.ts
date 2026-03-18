import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

const ORDER_STATUSES = [
  'Order Placed', 'Payment Confirmed', 'Processing',
  'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled',
];

const DELIVERY_LABELS: Record<string, string> = {
  lagos:         'Lagos (Same Day / Next Day)',
  nigeria:       'Nigeria (GUO / GIGM Bus)',
  international: 'International (DHL)',
};

const fmt = (n: number) => `₦${Number(n).toLocaleString()}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

  const { type, order, status } = await req.json();

  const RESEND_KEY = Deno.env.get('RESEND_API_KEY');
  const FROM = Deno.env.get('RESEND_FROM') ?? "Perry's Hairline <noreply@perrys-hairline.com>";

  if (!RESEND_KEY) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY not set' }), { status: 500 });
  }

  const email = order?.customer?.email;
  if (!email) {
    return new Response(JSON.stringify({ error: 'No customer email' }), { status: 400 });
  }

  const subject = type === 'receipt'
    ? `Order Confirmed – ${order.id} | Perry's Hairline`
    : `Order Update: ${ORDER_STATUSES[status] ?? 'Updated'} – ${order.id} | Perry's Hairline`;

  const html = type === 'receipt' ? receiptHtml(order) : trackingHtml(order, status);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: email, subject, html }),
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
});

// ── Receipt ───────────────────────────────────────────────────────────────────

function receiptHtml(order: any): string {
  const rows = (order.items ?? []).map((i: any) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0e8ec;font-size:14px">${i.name}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f0e8ec;text-align:center;font-size:14px;color:#888">×${i.qty}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f0e8ec;text-align:right;font-size:14px;font-weight:600">${fmt(i.price * i.qty)}</td>
    </tr>`).join('');

  const address = [
    order.customer?.address, order.customer?.city,
    order.customer?.state, order.customer?.country,
  ].filter(Boolean).join(', ');

  const firstName = (order.customer?.name ?? 'there').split(' ')[0];

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#fdf0f5;font-family:Georgia,serif">
<div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

  <div style="background:#1a0a0f;padding:32px;text-align:center">
    <div style="color:#c9973a;font-size:22px;letter-spacing:1px">✦ Perry's Hairline</div>
    <div style="color:#fff;font-size:13px;opacity:.7;margin-top:6px">Order Confirmation</div>
  </div>

  <div style="padding:36px">
    <h2 style="font-size:22px;margin:0 0 8px;color:#1a0a0f">Thank you, ${firstName}!</h2>
    <p style="color:#888;font-size:14px;margin:0 0 24px;line-height:1.6">
      Your order has been placed and will be processed shortly.
    </p>

    <div style="background:#fdf0f5;border-radius:8px;padding:18px;margin-bottom:24px;font-size:13px;line-height:2">
      <div><span style="color:#888;width:90px;display:inline-block">Order ID</span> <strong>${order.id}</strong></div>
      <div><span style="color:#888;width:90px;display:inline-block">Tracking</span> <strong>${order.tracking}</strong></div>
      <div><span style="color:#888;width:90px;display:inline-block">Delivery</span> <strong>${DELIVERY_LABELS[order.delivery] ?? order.delivery}</strong></div>
      <div><span style="color:#888;width:90px;display:inline-block">Date</span> <strong>${order.date}</strong></div>
    </div>

    <table style="width:100%;border-collapse:collapse">${rows}</table>

    <div style="border-top:2px solid #c9973a;padding-top:14px;margin-top:4px;text-align:right">
      <span style="font-size:18px;font-weight:bold;color:#c9973a">${fmt(order.total)}</span>
    </div>

    ${address ? `
    <div style="margin-top:24px;padding:16px;background:#f9f9f9;border-radius:8px;font-size:13px;color:#555;line-height:1.6">
      <strong>Delivery Address:</strong><br>${address}
    </div>` : ''}
  </div>

  <div style="background:#1a0a0f;padding:20px;text-align:center">
    <p style="color:#888;font-size:12px;margin:0">Questions? Just reply to this email.</p>
    <p style="color:#555;font-size:11px;margin:8px 0 0">© Perry's Hairline — Premium Hair, Premium Experience</p>
  </div>
</div>
</body></html>`;
}

// ── Tracking update ───────────────────────────────────────────────────────────

function trackingHtml(order: any, status: number): string {
  const statusLabel = ORDER_STATUSES[status] ?? 'Updated';
  const firstName = (order.customer?.name ?? 'there').split(' ')[0];
  const steps = ORDER_STATUSES.slice(0, 6);

  const stepRows = steps.map((s, i) => {
    const done = i < status;
    const current = i === status;
    const bg = done || current ? '#c9973a' : '#f0e8ec';
    const color = done || current ? '#fff' : '#bbb';
    const label = done ? '✓' : current ? '●' : String(i + 1);
    const textColor = i <= status ? '#1a0a0f' : '#aaa';
    const weight = current ? '700' : '400';
    return `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
      <div style="width:28px;height:28px;border-radius:50%;background:${bg};color:${color};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;flex-shrink:0">${label}</div>
      <span style="font-size:14px;color:${textColor};font-weight:${weight}">${s}</span>
    </div>`;
  }).join('');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#fdf0f5;font-family:Georgia,serif">
<div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

  <div style="background:#1a0a0f;padding:32px;text-align:center">
    <div style="color:#c9973a;font-size:22px;letter-spacing:1px">✦ Perry's Hairline</div>
    <div style="color:#fff;font-size:13px;opacity:.7;margin-top:6px">Order Update</div>
  </div>

  <div style="padding:36px">
    <h2 style="font-size:22px;margin:0 0 8px;color:#1a0a0f">
      Your order is <span style="color:#c9973a">${statusLabel}</span>
    </h2>
    <p style="color:#888;font-size:14px;margin:0 0 24px;line-height:1.6">
      Hi ${firstName}, here's the latest update on your Perry's Hairline order.
    </p>

    <div style="background:#fdf0f5;border-radius:8px;padding:16px;margin-bottom:24px;font-size:13px;line-height:2">
      <div><span style="color:#888;width:90px;display:inline-block">Order ID</span> <strong>${order.id}</strong></div>
      <div><span style="color:#888;width:90px;display:inline-block">Tracking</span> <strong>${order.tracking}</strong></div>
    </div>

    <div style="margin-bottom:8px">${stepRows}</div>
  </div>

  <div style="background:#1a0a0f;padding:20px;text-align:center">
    <p style="color:#888;font-size:12px;margin:0">Questions? Just reply to this email.</p>
    <p style="color:#555;font-size:11px;margin:8px 0 0">© Perry's Hairline — Premium Hair, Premium Experience</p>
  </div>
</div>
</body></html>`;
}
