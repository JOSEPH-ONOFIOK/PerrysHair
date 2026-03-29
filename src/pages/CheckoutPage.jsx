import { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../context.jsx';
import HairVisual from '../components/HairVisual.jsx';
import { supabase, insertOrder, decrementStock } from '../supabase.js';
import { sendReceiptEmail } from '../email.js';
import { applyCoupon } from '../coupons.js';
import BackButton from '../components/BackButton.jsx';

const COUNTRY_CURRENCY = {
  Nigeria:          { code: 'NGN', symbol: '₦' },
  Ghana:            { code: 'GHS', symbol: 'GH₵' },
  Kenya:            { code: 'KES', symbol: 'KSh' },
  'South Africa':   { code: 'ZAR', symbol: 'R' },
  'United Kingdom': { code: 'GBP', symbol: '£' },
  'United States':  { code: 'USD', symbol: '$' },
  Canada:           { code: 'CAD', symbol: 'CA$' },
  Other:            { code: 'USD', symbol: '$' },
};

// Currencies Paystack can charge in (fall back to USD if not listed)
const PAYSTACK_CURRENCIES = new Set(['NGN', 'USD', 'GHS', 'ZAR', 'KES']);

const DELIVERY_META = {
  lagos:   { label: 'Lagos',              desc: 'Fee paid directly to rider on delivery — price varies', time: 'Same Day / Next Day' },
  nigeria: { label: 'Nigeria (Interstate)', desc: 'GUO / GIGM Bus Delivery — flat rate',                  time: 'Within a week or 6 working days' },
  uk:      { label: 'United Kingdom',     desc: 'DHL Express + Duties',                                   time: '5–10 days' },
  us:      { label: 'United States',      desc: 'DHL Express + Duties',                                   time: '7–14 days' },
};

const payOptions = [
  { id: 'paystack', label: 'Paystack', desc: 'Nigerian debit/credit cards & bank transfer', flag: '🇳🇬' },
  { id: 'transfer', label: 'Bank Transfer', desc: 'Direct bank transfer to Perrys Hairline account', flag: '🏦' },
];

export default function CheckoutPage() {
  const { state, dispatch } = useContext(AppContext);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: state.user?.name || '', email: state.user?.email || '', phone: '', address: '', city: '', state: '', country: 'Nigeria', zip: '' });
  const [delivery, setDelivery] = useState('lagos');
  const [payMethod, setPayMethod] = useState('paystack');
  const [processing, setProcessing] = useState(false);
  const [rates, setRates] = useState({});
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const payBtnRef = useRef(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/NGN')
      .then((r) => r.json())
      .then((data) => { if (data.rates) setRates(data.rates); })
      .catch(() => {});
  }, []);

  const currency = COUNTRY_CURRENCY[form.country] || COUNTRY_CURRENCY.Other;
  const rate = rates[currency.code] ?? (currency.code === 'NGN' ? 1 : null);
  const converted = (ngnAmount) => (rate !== null ? ngnAmount * rate : ngnAmount);
  const fmtLocal = (ngnAmount) => {
    const amount = converted(ngnAmount);
    try {
      return new Intl.NumberFormat('en', {
        style: 'currency', currency: currency.code,
        minimumFractionDigits: 0, maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${currency.symbol}${amount.toLocaleString()}`;
    }
  };
  const payCurrency = PAYSTACK_CURRENCIES.has(currency.code) ? currency.code : 'USD';
  const payRate     = (code) => rates[code] ?? (code === 'NGN' ? 1 : rates['USD'] ?? 1);

  const SDK_URLS = {
    paystack: 'https://js.paystack.co/v1/inline.js',
  };

  useEffect(() => {
    if (step !== 3) return;
    const url = SDK_URLS[payMethod];
    if (!url || document.querySelector(`script[src="${url}"]`)) return;
    const s = document.createElement('script');
    s.src = url;
    s.async = true;
    document.head.appendChild(s);
  }, [step, payMethod]);

  const deliveryOptions = Object.entries(DELIVERY_META).map(([id, meta]) => ({
    id, ...meta, fee: state.delivery[id] ?? 0,
  }));

  const subtotal = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const service = Math.round(subtotal * 0.025);
  const deliveryFee = deliveryOptions.find((o) => o.id === delivery)?.fee || 0;
  const itemCount = state.cart.reduce((s, i) => s + i.qty, 0);
  const hairDiscount = itemCount * 5000;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const total = Math.max(0, subtotal + service + deliveryFee - hairDiscount - couponDiscount);

  const handleApplyCoupon = () => {
    setCouponError('');
    const result = applyCoupon(couponInput, subtotal);
    if (!result) { setCouponError('Invalid coupon code'); return; }
    setAppliedCoupon(result);
    setCouponInput('');
  };

  const buildOrder = () => {
    const rand = () => crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase();
    return {
      id: `PHR-${Date.now()}-${rand()}`,
      date: new Date().toISOString().split('T')[0],
      items: state.cart,
      total,
      status: 0,
      delivery,
      tracking: `PHR-${rand()}${rand()}`.slice(0, 12),
      customer: form,
    };
  };

  const saveAndConfirm = async (order) => {
    let orderSaved = true;
    try {
      // Fetch authoritative prices + stock from DB — never trust client-supplied prices
      const { data: products } = await supabase
        .from('products')
        .select('id, name, price, stock')
        .in('id', order.items.map((i) => i.id));

      if (!products || products.length !== order.items.length) {
        setProcessing(false);
        payBtnRef.current?.focus();
        dispatch({ type: 'SET_TOAST', payload: { msg: 'Some items in your cart are no longer available — please update your cart', icon: '❌' } });
        return;
      }

      // Recompute total server-side to prevent price manipulation
      const serverSubtotal = products.reduce((sum, p) => {
        const qty = order.items.find((i) => i.id === p.id)?.qty || 0;
        return sum + p.price * qty;
      }, 0);
      const serverVat = Math.round(serverSubtotal * 0.025);
      const serverDelivery = deliveryOptions.find((o) => o.id === order.delivery)?.fee || 0;
      const serverTotal = serverSubtotal + serverVat + serverDelivery;
      order = { ...order, total: serverTotal };

      // Re-verify stock after price recomputation (prevents TOCTOU race)
      for (const item of order.items) {
        const product = products.find((p) => p.id === item.id);
        if (!product || product.stock < item.qty) {
          setProcessing(false);
          payBtnRef.current?.focus();
          dispatch({ type: 'SET_TOAST', payload: { msg: `"${product?.name || 'An item'}" is out of stock — please update your cart`, icon: '❌' } });
          return;
        }
      }

      try {
        if (state.user?.id) await insertOrder(order, state.user.id);
      } catch {
        orderSaved = false;
      }
      try {
        decrementStock(order.items);
      } catch {
        // stock sync is best-effort
      }
    } catch {
      // suppress unexpected errors — order proceeds
    }
    sendReceiptEmail(order); // fire-and-forget
    order.items.forEach((item) => dispatch({ type: 'DECREMENT_STOCK', payload: { id: item.id, qty: item.qty } }));
    dispatch({ type: 'PLACE_ORDER', payload: order });
    if (!orderSaved) {
      dispatch({ type: 'SET_TOAST', payload: { msg: "Order placed but couldn't save to your account — screenshot your receipt", icon: '⚠️' } });
    } else {
      dispatch({ type: 'SET_TOAST', payload: { msg: 'Order placed! Receipt sent to your email 📧', icon: '✅' } });
    }
    setProcessing(false);
  };

  const verifyAndConfirm = async (order, reference) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ reference }),
          signal: controller.signal,
        }
      );
      clearTimeout(timeout);
      const data = await res.json();
      if (data.paid) {
        await saveAndConfirm(order);
      } else {
        setProcessing(false);
        payBtnRef.current?.focus();
        dispatch({ type: 'SET_TOAST', payload: { msg: 'Payment could not be verified — please contact support', icon: '❌' } });
      }
    } catch (err) {
      clearTimeout(timeout);
      setProcessing(false);
      payBtnRef.current?.focus();
      const msg = err.name === 'AbortError'
        ? 'Verification timed out — please contact support'
        : 'Verification error — please contact support';
      dispatch({ type: 'SET_TOAST', payload: { msg, icon: '❌' } });
    }
  };

  const placeOrder = () => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    const phoneOk = /^[\d\+\-\s()]{7,20}$/.test(form.phone);
    const validCountries = ['Nigeria','Ghana','Kenya','South Africa','United Kingdom','United States','Canada','Other'];

    if (!form.name.trim() || !form.email || !form.phone) {
      dispatch({ type: 'SET_TOAST', payload: { msg: 'Please fill in your contact details', icon: '⚠️' } });
      return;
    }
    if (!emailOk) {
      dispatch({ type: 'SET_TOAST', payload: { msg: 'Please enter a valid email address', icon: '⚠️' } });
      return;
    }
    if (!phoneOk) {
      dispatch({ type: 'SET_TOAST', payload: { msg: 'Please enter a valid phone number', icon: '⚠️' } });
      return;
    }
    if (form.address.length > 200 || form.city.length > 50 || form.state.length > 50) {
      dispatch({ type: 'SET_TOAST', payload: { msg: 'Address fields are too long', icon: '⚠️' } });
      return;
    }
    if (!validCountries.includes(form.country)) {
      dispatch({ type: 'SET_TOAST', payload: { msg: 'Please select a valid country', icon: '⚠️' } });
      return;
    }
    setProcessing(true);
    const order = buildOrder();

    if (payMethod === 'paystack') {
      const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
      const callbackUrl = `${window.location.origin}/?payment_ref=${order.id}`;

      const openPaystack = () => {
        // Save to both storages — sessionStorage can be lost during Opay/bank redirect chains
        const serialized = JSON.stringify(order);
        sessionStorage.setItem('pending_order', serialized);
        localStorage.setItem('pending_order', serialized);

        const handler = window.PaystackPop.setup({
          key: paystackKey,
          email: form.email,
          amount: Math.round(total * payRate(payCurrency) * 100),
          currency: payCurrency,
          ref: order.id,
          label: "Perry's Hairline",
          split_code: 'SPL_CdVGzimWep',
          callback_url: callbackUrl,
          metadata: { custom_fields: [{ display_name: 'Customer Name', variable_name: 'customer_name', value: form.name }] },
          callback: (transaction) => {
            sessionStorage.removeItem('pending_order');
            localStorage.removeItem('pending_order');
            verifyAndConfirm(order, transaction?.reference || order.id);
          },
          onClose: () => { setProcessing(false); payBtnRef.current?.focus(); },
        });
        handler.openIframe();
      };

      if (window.PaystackPop) {
        openPaystack();
      } else {
        const s = document.querySelector(`script[src="${SDK_URLS.paystack}"]`);
        if (s) s.addEventListener('load', openPaystack, { once: true });
        else { setProcessing(false); dispatch({ type: 'SET_TOAST', payload: { msg: 'Paystack failed to load — check your connection', icon: '❌' } }); }
      }
    } else if (payMethod === 'transfer') {
      order.status = 0;
      saveAndConfirm(order);
    }
  };

  const stepLabels = ['Contact Info', 'Delivery', 'Payment'];

  if (state.cart.length === 0) {
    return (
      <div style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(24px,5vw,40px) clamp(16px,4vw,24px)', textAlign: 'center' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🛍️</div>
        <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, marginBottom: 12 }}>Your cart is empty</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: 24 }}>Add some products before checking out.</p>
        <button className="btn-primary" style={{ padding: '13px 32px' }}
          onClick={() => dispatch({ type: 'SET_VIEW', payload: 'products' })}>
          Go to Shop
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(24px,5vw,40px) clamp(16px,4vw,24px)' }}>
      <BackButton fallback="cart" label="← Back to Cart" style={{ marginBottom: 16 }} />
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
                    <span style={{ fontWeight: 700, color: 'var(--gold)' }}>
                      {opt.id === 'lagos' ? 'Pay on delivery' : fmtLocal(opt.fee)}
                    </span>
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
              {payMethod === 'paystack' && (
                <div style={{ background: '#fffbe6', border: '1px solid #f0d070', borderRadius: 8, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#7a5800', lineHeight: 1.6 }}>
                  <strong>Important:</strong> After completing payment on Paystack, <strong>return to this page</strong> to confirm your order. Do not close your browser — your order will be confirmed automatically once you're back.
                </div>
              )}
              {payMethod === 'transfer' && (
                <div style={{ background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Transfer Details</div>
                  <div style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.8 }}>
                    Bank: {state.bank.bank_name}<br />
                    Account: {state.bank.bank_account}<br />
                    Name: {state.bank.bank_account_name}<br />
                    Reference: <strong style={{ color: 'var(--gold)' }}>PHR-{Date.now().toString().slice(-6)}</strong>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-light)', padding: '8px 10px', background: 'rgba(201,151,58,0.08)', borderRadius: 6 }}>
                    After transferring, click "Confirm Transfer" and your order will be held pending admin verification.
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-outline" style={{ padding: '11px 24px' }} onClick={() => setStep(2)}>← Back</button>
                <button ref={payBtnRef} className="btn-primary" style={{ padding: '12px 32px', opacity: processing ? 0.7 : 1 }}
                  onClick={placeOrder} disabled={processing}>
                  {processing ? '⏳ Processing...' : payMethod === 'transfer' ? `Confirm Transfer · ${fmtLocal(total)}` : `Pay ${fmtLocal(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <div className="card" style={{ padding: 20, position: 'sticky', top: 80 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: 16, margin: 0 }}>Order Summary</h3>
              <span style={{ fontSize: 11, color: 'var(--text-light)', background: 'var(--border)', borderRadius: 4, padding: '2px 6px' }}>
                {currency.code}{rate === null ? ' · loading…' : ''}
              </span>
            </div>
            {state.cart.map((i) => {
              const liveProduct = state.products.find((p) => p.id === i.id);
              const lowStock = liveProduct && liveProduct.stock > 0 && liveProduct.stock < i.qty;
              const outOfStock = liveProduct && liveProduct.stock === 0;
              return (
                <div key={i.id} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ background: 'var(--blush)', borderRadius: 6, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <HairVisual image={i.image} size={34} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{i.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-light)' }}>x{i.qty}</div>
                    {outOfStock && <div style={{ fontSize: 10, color: '#cc3333', fontWeight: 600 }}>Out of stock</div>}
                    {lowStock && <div style={{ fontSize: 10, color: '#b06000', fontWeight: 600 }}>Only {liveProduct.stock} left</div>}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{fmtLocal(i.price * i.qty)}</span>
                </div>
              );
            })}
            <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />
            {/* Coupon code */}
            <div style={{ marginBottom: 12 }}>
              {appliedCoupon ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#e8f5ee', border: '1px solid #2D7A51', borderRadius: 8, padding: '8px 12px' }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#2D7A51' }}>🎟 {appliedCoupon.code}</span>
                    <span style={{ fontSize: 11, color: '#2D7A51', marginLeft: 6 }}>{appliedCoupon.label} applied!</span>
                  </div>
                  <button onClick={() => setAppliedCoupon(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2D7A51', fontSize: 16, lineHeight: 1 }}>×</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    className="input-field"
                    placeholder="Coupon code"
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    style={{ flex: 1, fontSize: 13, padding: '9px 12px' }}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    style={{ background: 'var(--gold)', color: 'white', border: 'none', borderRadius: 8, padding: '0 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >Apply</button>
                </div>
              )}
              {couponError && <p style={{ fontSize: 11, color: '#c0392b', marginTop: 4, marginBottom: 0 }}>{couponError}</p>}
            </div>

            {[['Subtotal', fmtLocal(subtotal)], ['VAT (2.5%)', fmtLocal(service)], ['Delivery', fmtLocal(deliveryFee)]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, color: 'var(--text-mid)' }}>
                <span>{l}</span><span>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, color: '#2D7A51', fontWeight: 600 }}>
              <span>🎉 Hair Discount ({itemCount} × ₦5,000)</span>
              <span>−{fmtLocal(hairDiscount)}</span>
            </div>
            {appliedCoupon && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, color: '#2D7A51', fontWeight: 600 }}>
                <span>Coupon ({appliedCoupon.label})</span>
                <span>−{fmtLocal(couponDiscount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <span>Total</span><span style={{ color: 'var(--gold)' }}>{fmtLocal(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
