import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

  // Payload from Supabase DB webhook on auth.users INSERT
  const payload = await req.json();
  const record = payload.record ?? payload; // handle both webhook and direct call shapes
  const email = record?.email;
  const name = record?.raw_user_meta_data?.name
    ?? record?.user_metadata?.name
    ?? email?.split('@')[0]
    ?? 'there';

  if (!email) return new Response('No email', { status: 400, headers: CORS });

  const RESEND_KEY = Deno.env.get('RESEND_API_KEY');
  const FROM = Deno.env.get('RESEND_FROM') ?? "Perry's Hairline <noreply@perrys-hairline.com>";

  if (!RESEND_KEY) return new Response('RESEND_API_KEY not set', { status: 500, headers: CORS });

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: email,
      subject: "Welcome to Perry's Hairline ✦",
      html: welcomeHtml(name),
    }),
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
});

function welcomeHtml(name: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#fdf0f5;font-family:Georgia,serif">
<div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

  <div style="background:#1a0a0f;padding:48px 32px;text-align:center">
    <div style="color:#c9973a;font-size:28px;letter-spacing:2px;margin-bottom:10px">✦ Perry's Hairline</div>
    <div style="color:#fff;font-size:15px;opacity:.75">Welcome to the family</div>
  </div>

  <div style="padding:48px 40px;text-align:center">
    <h2 style="font-size:26px;margin:0 0 16px;color:#1a0a0f">Hi ${name}, welcome! 🌸</h2>
    <p style="color:#666;font-size:15px;line-height:1.8;margin:0 0 32px;max-width:400px;margin-left:auto;margin-right:auto">
      We're so glad you're here. Perry's Hairline is your home for premium hair —
      crafted with love, delivered with care.
    </p>

    <a href="https://perrys-hairline.netlify.app"
       style="display:inline-block;background:#c9973a;color:#fff;text-decoration:none;padding:16px 44px;border-radius:8px;font-size:15px;font-weight:bold;letter-spacing:.5px">
      Start Shopping
    </a>

    <p style="color:#aaa;font-size:13px;margin-top:36px;line-height:1.7">
      Browse our collection of sleek bobs, goddess curls,<br>
      beach waves, bone straight, and more.<br>
      Each piece is made to make you feel your absolute best.
    </p>
  </div>

  <div style="background:#1a0a0f;padding:24px;text-align:center">
    <p style="color:#555;font-size:12px;margin:0">© Perry's Hairline — Premium Hair, Premium Experience</p>
  </div>
</div>
</body></html>`;
}
