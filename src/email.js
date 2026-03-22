const EDGE_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const ANON_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function callEdge(fn, body) {
  try {
    await fetch(`${EDGE_BASE}/${fn}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    // Email is best-effort — don't block the UI if it fails
    console.error(`[email] ${fn} failed:`, err?.message ?? err);
  }
}

export const sendReceiptEmail  = (order)         => callEdge('send-order-email', { type: 'receipt',  order });
export const sendTrackingEmail = (order, status) => callEdge('send-order-email', { type: 'tracking', order, status });
