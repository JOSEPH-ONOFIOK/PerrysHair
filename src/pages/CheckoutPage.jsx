import { useContext, useState } from 'react';
import { AppContext } from '../context.jsx';
import HairVisual from '../components/HairVisual.jsx';
import { fmt } from '../data.js';
import { insertOrder } from '../supabase.js';

const DELIVERY_META = {
  lagos:         { label: 'Lagos (Same Day / Next Day)', desc: 'Uber Algorithm Pricing', time: '3–12 hours' },
  nigeria:       { label: 'Nigeria (GUO / GIGM Bus)',   desc: 'GIGM/GUO Bus Delivery',  time: '1–3 days'   },
  international: { label: 'International (DHL)',         desc: 'DHL Express + Duties',   time: '5–10 days'  },
};

const payOptions = [
  { id: 'paystack', label: 'Paystack', desc: 'Nigerian debit/credit cards & bank transfer', flag: '🇳🇬' },
  { id: 'flutterwave', label: 'Flutterwave', desc: 'Cards, mobile money, bank transfer (Africa-wide)', flag: '🌍' },
  { id: 'stripe', label: 'Stripe', desc: 'International credit/debit cards (Visa, Mastercard, Amex)', flag: '🌐' },
  { id: 'transfer', label: 'Bank Transfer', desc: 'Direct bank transfer to Perrys Hairline account', flag: '🏦' },
];

export default function CheckoutPage() {
  const { state, dispatch } = useContext(AppContext);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: state.user?.name || '', email: state.user?.email || '', phone: '', address: '', city: '', state: '', country: 'Nigeria', zip: '' });
  const [delivery, setDelivery] = useState('lagos');
  const [payMethod, setPayMethod] = useState('paystack');
  const [processing, setProcessing] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const deliveryOptions = Object.entries(DELIVERY_META).map(([id, meta]) => ({
    id, ...meta, fee: state.delivery[id] ?? 0,
  }));

  const subtotal = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const service = Math.round(subtotal * 0.02);
  const deliveryFee = deliveryOptions.find((o) => o.id === delivery)?.fee || 0;
  const total = subtotal + service + deliveryFee;

  const buildOrder = () => ({
    id: `PHR-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    items: state.cart,
    total,
    status: 0,
    delivery,
    tracking: `PHR${Math.floor(Math.random() * 9000000 + 1000000)}`,
    customer: form,
  });

  const saveAndConfirm = async (order) => {
    try {
      if (state.user?.id) await insertOrder(order, state.user.id);
    } catch (err) {
      console.error('Failed to save order:', err);
    }
    dispatch({ type: 'PLACE_ORDER', payload: order });
    dispatch({ type: 'SET_TOAST', payload: { msg: 'Order placed! Receipt sent to your email 📧', icon: '✅' } });
    setProcessing(false);
  };

  const placeOrder = () => {
    if (!form.name || !form.email || !form.phone) {
      dispatch({ type: 'SET_TOAST', payload: { msg: 'Please fill in your contact details first', icon: '⚠️' } });
      return;
    }
    setProcessing(true);
    const order = buildOrder();

    if (payMethod === 'paystack') {
      const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: form.email,
        amount: Math.round(total * 100), // kobo
        currency: 'NGN',
        ref: order.id,
        metadata: { custom_fields: [{ display_name: 'Customer Name', variable_name: 'customer_name', value: form.name }] },
        callback: () => saveAndConfirm(order),
        onClose: () => setProcessing(false),
      });
      handler.openIframe();
    } else if (payMethod === 'flutterwave') {
      window.FlutterwaveCheckout({
        public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: order.id,
        amount: total,
        currency: 'NGN',
        payment_options: 'card,banktransfer,ussd',
        customer: { email: form.email, phone_number: form.phone, name: form.name },
        customizations: { title: "Perry's Hairline", description: 'Hair products order', logo: '' },
        callback: (response) => {
          if (response.status === 'successful' || response.status === 'completed') {
            saveAndConfirm(order);
          } else {
            setProcessing(false);
          }
        },
        onclose: () => setProcessing(false),
      });
    } else if (payMethod === 'transfer') {
      // Order saved immediately; awaits manual confirmation by admin
      order.status = 0; // pending
      saveAndConfirm(order);
    } else {
      setProcessing(false);
      dispatch({ type: 'SET_TOAST', payload: { msg: 'Stripe requires a server-side setup — contact support', icon: '⚠️' } });
    }
  };

  const stepLabels = ['Contact Info', 'Delivery', 'Payment'];

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(24px,5vw,40px) clamp(16px,4vw,24px)' }}>
      <h1 style={{ fontFamily: 'Playfair Display', fontSize: 30, marginBottom: 8 }}>Checkout</h1>

      {/* Steps */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32, alignItems: 'center', flexWrap: 'wrap' }}>
        {[1, 2, 3].map((s) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: step >= s ? 'var(--gold)' : 'var(--border)', color: step >= s ? 'white' : 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{s}</div>
            <span style={{ fontSize: 13, color: step >= s ? 'var(--text-dark)' : 'var(--text-light)', fontWeight: step === s ? 600 : 400 }}>{stepLabels[s - 1]}</span>
            {s < 3 && <div style={{ width: 24, height: 1, background: step > s ? 'var(--gold)' : 'var(--border)' }} />}
          </div>
        ))}
      </div>

      <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28 }}>
        <div>
          {/* Step 1: Contact */}
          {step === 1 && (
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: 18, marginBottom: 20 }}>Contact & Delivery Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {[['Full Name', 'name', 'text', 'Your full name'], ['Phone Number', 'phone', 'tel', '+234 XXX XXX XXXX'], ['Email', 'email', 'email', 'yourname@email.com'], ['Street Address', 'address', 'text', 'House/flat number, street']].map(([l, k, t, ph]) => (
                  <div key={k} style={{ gridColumn: k === 'address' ? '1/-1' : 'auto' }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', display: 'block', marginBottom: 6 }}>{l}</label>
                    <input className="input-field" type={t} placeholder={ph} value={form[k]} onChange={(e) => set(k, e.target.value)} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', display: 'block', marginBottom: 6 }}>City</label>
                  <input className="input-field" placeholder="Lagos" value={form.city} onChange={(e) => set('city', e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', display: 'block', marginBottom: 6 }}>State</label>
                  <input className="input-field" placeholder="Lagos State" value={form.state} onChange={(e) => set('state', e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', display: 'block', marginBottom: 6 }}>Country</label>
                  <select className="input-field" value={form.country} onChange={(e) => set('country', e.target.value)}>
                    {['Nigeria','Ghana','Kenya','South Africa','United Kingdom','United States','Canada','Other'].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', display: 'block', marginBottom: 6 }}>Zip / Postal Code</label>
                  <input className="input-field" placeholder="100001" value={form.zip} onChange={(e) => set('zip', e.target.value)} />
                </div>
              </div>
              <button className="btn-primary" style={{ marginTop: 24, padding: '13px 32px' }} onClick={() => setStep(2)}>Continue to Delivery →</button>
            </div>
          )}

          {/* Step 2: Delivery */}
          {step === 2 && (
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: 18, marginBottom: 20 }}>Delivery Method</h3>
              {deliveryOptions.map((opt) => (
                <div key={opt.id} onClick={() => setDelivery(opt.id)}
                  style={{ border: `1.5px solid ${delivery === opt.id ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 10, padding: 18, marginBottom: 12, cursor: 'pointer', background: delivery === opt.id ? 'rgba(201,151,58,0.04)' : 'white', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${delivery === opt.id ? 'var(--gold)' : 'var(--border)'}`, background: delivery === opt.id ? 'var(--gold)' : 'white', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{opt.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>{opt.desc} • {opt.time}</div>
                      </div>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--gold)' }}>{fmt(opt.fee)}</span>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button className="btn-outline" style={{ padding: '11px 24px' }} onClick={() => setStep(1)}>← Back</button>
                <button className="btn-primary" style={{ padding: '12px 28px' }} onClick={() => setStep(3)}>Continue to Payment →</button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: 18, marginBottom: 20 }}>Payment Method</h3>
              {payOptions.map((opt) => (
                <div key={opt.id} onClick={() => setPayMethod(opt.id)}
                  style={{ border: `1.5px solid ${payMethod === opt.id ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 10, padding: 16, marginBottom: 12, cursor: 'pointer', background: payMethod === opt.id ? 'rgba(201,151,58,0.04)' : 'white', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${payMethod === opt.id ? 'var(--gold)' : 'var(--border)'}`, background: payMethod === opt.id ? 'var(--gold)' : 'white', flexShrink: 0 }} />
                    <span style={{ fontSize: 18 }}>{opt.flag}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{opt.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
              {payMethod === 'transfer' && (
                <div style={{ background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Transfer Details</div>
                  <div style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.8 }}>
                    Bank: {import.meta.env.VITE_BANK_NAME || 'Guaranty Trust Bank'}<br />
                    Account: {import.meta.env.VITE_BANK_ACCOUNT || '0123456789'}<br />
                    Name: {import.meta.env.VITE_BANK_ACCOUNT_NAME || 'Perrys Hairline Ltd'}<br />
                    Reference: <strong style={{ color: 'var(--gold)' }}>PHR-{Date.now().toString().slice(-6)}</strong>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-light)', padding: '8px 10px', background: 'rgba(201,151,58,0.08)', borderRadius: 6 }}>
                    After transferring, click "Confirm Transfer" and your order will be held pending admin verification.
                  </div>
                </div>
              )}
              {payMethod === 'stripe' && (
                <div style={{ background: '#fff8f0', border: '1px solid #f0d8b0', borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 13, color: '#a07030' }}>
                  Stripe is available for international cards. Ensure your Stripe publishable key is configured and a server-side Payment Intent endpoint is set up.
                </div>
              )}
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-outline" style={{ padding: '11px 24px' }} onClick={() => setStep(2)}>← Back</button>
                <button className="btn-primary" style={{ padding: '12px 32px', opacity: processing ? 0.7 : 1 }}
                  onClick={placeOrder} disabled={processing}>
                  {processing ? '⏳ Processing...' : payMethod === 'transfer' ? `Confirm Transfer · ${fmt(total)}` : `Pay ${fmt(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <div className="card" style={{ padding: 20, position: 'sticky', top: 80 }}>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: 16, marginBottom: 16 }}>Order Summary</h3>
            {state.cart.map((i) => (
              <div key={i.id} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                <div style={{ background: 'var(--blush)', borderRadius: 6, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <HairVisual image={i.image} size={34} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{i.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-light)' }}>x{i.qty}</div>
                </div>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{fmt(i.price * i.qty)}</span>
              </div>
            ))}
            <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />
            {[['Subtotal', fmt(subtotal)], ['Service Fee (2%)', fmt(service)], ['Delivery', fmt(deliveryFee)]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, color: 'var(--text-mid)' }}>
                <span>{l}</span><span>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <span>Total</span><span style={{ color: 'var(--gold)' }}>{fmt(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
