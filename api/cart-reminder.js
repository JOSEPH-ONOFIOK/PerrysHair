import { createClient } from '@supabase/supabase-js';

// Uses service role key — never exposed to frontend
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // Vercel cron sends GET; protect with secret header
  const secret = req.headers['x-cron-secret'];
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get cart items older than 6 hours
    const cutoff = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

    const { data: cartRows } = await supabase
      .from('cart_items')
      .select('user_id, product_name, product_price, qty')
      .lt('created_at', cutoff);

    if (!cartRows?.length) return res.json({ sent: 0 });

    // Group by user
    const byUser = {};
    cartRows.forEach((row) => {
      if (!byUser[row.user_id]) byUser[row.user_id] = [];
      byUser[row.user_id].push(row);
    });

    // Fetch user emails via admin API
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const userMap = {};
    users.forEach((u) => { userMap[u.id] = { email: u.email, name: u.user_metadata?.name }; });

    // Send reminder to each user
    let sent = 0;
    const rawAppUrl = process.env.APP_URL || 'https://perrys-hair.vercel.app';
    // Guard against SSRF: only allow https and known safe hosts
    const parsedUrl = new URL(rawAppUrl);
    if (parsedUrl.protocol !== 'https:') throw new Error('APP_URL must use HTTPS');
    const BLOCKED = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.0\.0\.0|::1)/i;
    if (BLOCKED.test(parsedUrl.hostname)) throw new Error('APP_URL points to internal host');
    const appUrl = rawAppUrl.replace(/\/$/, '');

    for (const [userId, items] of Object.entries(byUser)) {
      const user = userMap[userId];
      if (!user?.email) continue;

      await fetch(`${appUrl}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'cart-reminder',
          name: user.name,
          email: user.email,
          items,
        }),
      });
      sent++;
    }

    res.json({ sent });
  } catch {
    res.status(500).json({ error: 'Cart reminder failed' });
  }
}
