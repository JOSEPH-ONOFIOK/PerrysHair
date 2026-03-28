// Static coupon codes — add/remove as needed
// type: 'percent' deducts a percentage, 'fixed' deducts a flat NGN amount
export const COUPONS = {
  PERRY10:   { type: 'percent', value: 10,    label: '10% off' },
  WELCOME5:  { type: 'percent', value: 5,     label: '5% off' },
  LAUNCH500: { type: 'fixed',   value: 500,   label: '₦500 off' },
  VVIP1000:  { type: 'fixed',   value: 1000,  label: '₦1,000 off' },
};

export function applyCoupon(code, subtotal) {
  const coupon = COUPONS[code?.toUpperCase()?.trim()];
  if (!coupon) return null;
  const discount = coupon.type === 'percent'
    ? Math.round(subtotal * coupon.value / 100)
    : Math.min(coupon.value, subtotal);
  return { ...coupon, code: code.toUpperCase().trim(), discount };
}
