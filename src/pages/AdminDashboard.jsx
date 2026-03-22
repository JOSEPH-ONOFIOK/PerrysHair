import { useContext, useState } from 'react';
import { AppContext } from '../context.jsx';
import { ORDER_STATUSES, CATEGORIES, HAIR_GRADIENTS, fmt } from '../data.js';
import { insertProduct, updateProduct, deleteProduct, updateOrderStatus, deleteOrder, fetchOrders, saveDeliverySettings, saveBankDetails, uploadProductImage } from '../supabase.js';
import { sendTrackingEmail } from '../email.js';

const GRADIENT_KEYS = Object.keys(HAIR_GRADIENTS);

const EMPTY_FORM = {
  name: '', category: 'Bobs', price: '', originalPrice: '',
  length: '', color: '', description: '', stock: 0, bestSeller: false,
  image: GRADIENT_KEYS[0],
};


export default function AdminDashboard() {
  const { state, dispatch } = useContext(AppContext);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [pricingId, setPricingId] = useState(null);
  const [priceForm, setPriceForm] = useState({ price: '', originalPrice: '' });
  const [deliveryForm, setDeliveryForm] = useState(null);
  const [deliverySaving, setDeliverySaving] = useState(false);
  const [bankForm, setBankForm] = useState(null);
  const [bankSaving, setBankSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [confirmDeleteOrder, setConfirmDeleteOrder] = useState(null); // order object to delete

  function handleFormChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setUploading(true);
    try {
      let imageValue = form.image;
      if (imageFile) {
        imageValue = await uploadProductImage(imageFile);
      }
      const product = {
        ...form,
        image: imageValue,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        stock: Number(form.stock) || 0,
      };
      if (editingId !== null) {
        const updated = await updateProduct(editingId, product);
        dispatch({ type: 'EDIT_PRODUCT', payload: updated });
        dispatch({ type: 'SET_TOAST', payload: { msg: 'Product updated!', icon: '✅' } });
        setEditingId(null);
      } else {
        const created = await insertProduct(product);
        dispatch({ type: 'ADD_PRODUCT', payload: created });
        dispatch({ type: 'SET_TOAST', payload: { msg: 'Product added!', icon: '🎉' } });
      }
      setForm(EMPTY_FORM);
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      dispatch({ type: 'SET_TOAST', payload: { msg: err.message || 'Failed to save product', icon: '❌' } });
    }
    setUploading(false);
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice ?? '',
      length: product.length,
      color: product.color,
      description: product.description,
      stock: product.stock ?? 0,
      bestSeller: product.bestSeller,
      image: product.image,
    });
    setImageFile(null);
    setImagePreview(product.image?.startsWith('http') ? product.image : null);
    dispatch({ type: 'SET_ADMIN_TAB', payload: 'products' });
  }

  if (!state.user?.isAdmin)
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: 60, marginBottom: 12 }}>🔒</div>
        <h2 style={{ fontFamily: 'Playfair Display', fontSize: 22 }}>Admin Access Only</h2>
        <p style={{ color: 'var(--text-light)', marginTop: 8 }}>Your account does not have admin access. Contact the store owner to be granted admin rights.</p>
      </div>
    );

  const tab = state.adminTab;
  const totalRevenue = state.orders.reduce((s, o) => s + o.total, 0);
  const lagosOrders = state.orders.filter((o) => o.delivery === 'lagos');
  const nigOrders = state.orders.filter((o) => o.delivery === 'nigeria');
  const intlOrders = state.orders.filter((o) => o.delivery === 'international');

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 28 }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-light)', fontSize: 14 }}>Perrys Hairline Operations Centre</p>
        </div>
        <span className="badge badge-gold">Admin</span>
      </div>

      {/* Stats */}
      <div className="admin-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          ['Total Revenue', fmt(totalRevenue), '💰', '#E8F5EE', '#2D7A51'],
          ['Total Orders', state.orders.length, '📦', '#FFF3E0', '#B06000'],
          ['Lagos Orders', lagosOrders.length, '🏙️', '#E8F0FF', '#2D4CB0'],
          ['National', nigOrders.length, '🇳🇬', '#FFF0F5', '#B02D5A'],
          ['International', intlOrders.length, '✈️', '#F0F8FF', '#0070B0'],
        ].map(([label, val, icon, bg, col]) => (
          <div key={label} className="card" style={{ padding: 20, background: bg, border: 'none' }}>
            <div style={{ fontSize: 24 }}>{icon}</div>
            <div style={{ fontFamily: 'Playfair Display', fontSize: 24, fontWeight: 700, color: col, marginTop: 8 }}>{val}</div>
            <div style={{ fontSize: 12, color: col, opacity: 0.8, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="admin-tabs" style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[['orders', 'Orders'], ['history', 'Order History'], ['customers', 'Customers'], ['products', 'Products'], ['delivery', 'Delivery Pricing']].map(([v, l]) => (
          <button key={v} className={`tab-btn${tab === v ? ' active' : ''}`}
            onClick={() => dispatch({ type: 'SET_ADMIN_TAB', payload: v })}>{l}</button>
        ))}
      </div>

      {/* Orders tab */}
      {tab === 'orders' && (
        <div>
          {state.orders.map((order) => (
            <div key={order.id} className="card" style={{ padding: 20, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{order.id}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{order.date} • {order.items.length} items • {order.delivery}</div>
                  {order.customer && (
                    <div style={{ fontSize: 12, color: 'var(--text-mid)', marginTop: 2 }}>{order.customer.name} — {order.customer.email}</div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: 'var(--gold)' }}>{fmt(order.total)}</span>
                  <span className={`badge ${order.status >= 5 ? 'badge-green' : 'badge-gold'}`}>{ORDER_STATUSES[order.status]}</span>
                  <select className="input-field" style={{ width: 'auto', padding: '6px 10px', fontSize: 12 }}
                    value={order.status}
                    onChange={async (e) => {
                      const status = Number(e.target.value);
                      try {
                        await updateOrderStatus(order.id, status);
                        dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { id: order.id, status } });
                        sendTrackingEmail(order, status); // fire-and-forget
                        dispatch({ type: 'SET_TOAST', payload: { msg: 'Status updated!', icon: '✅' } });
                      } catch {
                        dispatch({ type: 'SET_TOAST', payload: { msg: 'Failed to update status', icon: '❌' } });
                      }
                    }}>
                    {ORDER_STATUSES.map((s, i) => <option key={i} value={i}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History tab */}
      {tab === 'history' && (() => {
        // Timeline: group orders by month
        const byMonth = {};
        state.orders.forEach((o) => {
          const key = o.date?.slice(0, 7) || 'Unknown';
          if (!byMonth[key]) byMonth[key] = { count: 0, revenue: 0 };
          byMonth[key].count++;
          byMonth[key].revenue += o.total;
        });
        const months = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b));
        const maxCount = Math.max(...months.map(([, v]) => v.count), 1);

        // CSV download
        const downloadCSV = () => {
          const rows = [
            ['Order ID', 'Date', 'Customer', 'Email', 'Delivery', 'Status', 'Total (₦)', 'Items'],
            ...state.orders.map((o) => [
              o.id, o.date,
              o.customer?.name || '', o.customer?.email || '',
              o.delivery, ORDER_STATUSES[o.status],
              o.total,
              (o.items || []).map((i) => `${i.name} x${i.qty}`).join('; '),
            ]),
          ];
          const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
          const a = document.createElement('a');
          a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
          a.download = `perrys-orders-${new Date().toISOString().slice(0, 10)}.csv`;
          a.click();
        };

        return (
          <div>
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: 17 }}>Order History ({state.orders.length})</h3>
              <button className="btn-outline" style={{ fontSize: 13, padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 6 }} onClick={downloadCSV}>
                ⬇ Download CSV
              </button>
            </div>

            {/* Zone summary cards */}
            <div className="admin-history-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
              {[['Lagos Orders', lagosOrders], ['National Orders', nigOrders], ['International Orders', intlOrders]].map(([title, orders]) => (
                <div key={title} className="card" style={{ padding: 20 }}>
                  <h3 style={{ fontFamily: 'Playfair Display', fontSize: 15, marginBottom: 12 }}>{title}</h3>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--gold)' }}>{orders.length}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 4 }}>Total: {fmt(orders.reduce((s, o) => s + o.total, 0))}</div>
                </div>
              ))}
            </div>

            {/* Timeline chart */}
            {months.length > 0 && (
              <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'Playfair Display', fontSize: 15, marginBottom: 20 }}>Orders by Month</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, overflowX: 'auto', paddingBottom: 8, minHeight: 120 }}>
                  {months.map(([month, { count, revenue }]) => (
                    <div key={month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 52 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)' }}>{count}</span>
                      <div
                        title={`${count} orders · ${fmt(revenue)}`}
                        style={{
                          width: 36, borderRadius: '6px 6px 0 0',
                          background: 'linear-gradient(180deg, var(--gold), #b8882a)',
                          height: Math.max(12, (count / maxCount) * 90),
                          transition: 'height 0.3s',
                        }}
                      />
                      <span style={{ fontSize: 10, color: 'var(--text-light)', whiteSpace: 'nowrap' }}>
                        {new Date(month + '-01').toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order rows */}
            {state.orders.map((order) => (
              <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: 'white', borderRadius: 8, marginBottom: 8, border: '1px solid var(--border)', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{order.id}</span>
                  {order.customer && <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{order.customer.name}</div>}
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-light)' }}>{order.date}</span>
                <span className="badge badge-blush">{order.delivery}</span>
                <span style={{ fontWeight: 700, color: 'var(--gold)' }}>{fmt(order.total)}</span>
                <span className={`badge ${order.status >= 5 ? 'badge-green' : 'badge-gold'}`}>{ORDER_STATUSES[order.status]}</span>
                <button
                  onClick={() => setConfirmDeleteOrder(order)}
                  style={{ background: 'none', border: '1px solid #ffcccc', borderRadius: 6, color: '#cc3333', fontSize: 12, padding: '4px 10px', cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Products tab */}
      {tab === 'products' && (
        <div>
          {/* Add / Edit form */}
          <div className="card" style={{ padding: 24, marginBottom: 28 }}>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: 17, marginBottom: 16 }}>
              {editingId !== null ? 'Edit Product' : 'Add New Product'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-light)', display: 'block', marginBottom: 4 }}>Product Name *</label>
                  <input className="input-field" name="name" value={form.name} onChange={handleFormChange} placeholder="e.g. Sleek Bob Cut" required />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-light)', display: 'block', marginBottom: 4 }}>Category *</label>
                  <select className="input-field" name="category" value={form.category} onChange={handleFormChange}>
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-light)', display: 'block', marginBottom: 4 }}>Price (₦) *</label>
                  <input className="input-field" name="price" type="number" value={form.price} onChange={handleFormChange} placeholder="e.g. 45000" required min={0} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-light)', display: 'block', marginBottom: 4 }}>Original Price (₦) — for sale</label>
                  <input className="input-field" name="originalPrice" type="number" value={form.originalPrice} onChange={handleFormChange} placeholder="Leave blank if no sale" min={0} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-light)', display: 'block', marginBottom: 4 }}>Length *</label>
                  <input className="input-field" name="length" value={form.length} onChange={handleFormChange} placeholder="e.g. 18 inch" required />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-light)', display: 'block', marginBottom: 4 }}>Color *</label>
                  <input className="input-field" name="color" value={form.color} onChange={handleFormChange} placeholder="e.g. Jet Black" required />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ fontSize: 12, color: 'var(--text-light)', display: 'block', marginBottom: 4 }}>Product Photo</label>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <label style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      background: 'var(--warm-white)', border: '1.5px dashed var(--border)',
                      borderRadius: 8, padding: '9px 16px', cursor: 'pointer', fontSize: 13, color: 'var(--text-mid)',
                    }}>
                      📷 {imageFile ? imageFile.name : 'Choose photo'}
                      <input type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={(e) => {
                          const f = e.target.files[0];
                          if (!f) return;
                          setImageFile(f);
                          setImagePreview(URL.createObjectURL(f));
                        }}
                      />
                    </label>
                    {imagePreview ? (
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img src={imagePreview} alt="preview" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                        <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); setForm(f => ({ ...f, image: GRADIENT_KEYS[0] })); }}
                          style={{ position: 'absolute', top: -6, right: -6, background: '#c0392b', color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, fontSize: 10, cursor: 'pointer', lineHeight: '18px', textAlign: 'center' }}>✕</button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--text-light)' }}>or use placeholder style:
                        <select className="input-field" name="image" value={form.image} onChange={handleFormChange}
                          style={{ marginLeft: 8, width: 'auto', padding: '5px 8px', fontSize: 12, display: 'inline-block' }}>
                          {GRADIENT_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: 'var(--text-light)', display: 'block', marginBottom: 4 }}>Description *</label>
                <textarea className="input-field" name="description" value={form.description} onChange={handleFormChange} placeholder="Describe the product..." required rows={3} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-light)', display: 'block', marginBottom: 4 }}>Stock Quantity *</label>
                  <input className="input-field" type="number" name="stock" min="0" value={form.stock} onChange={handleFormChange} placeholder="0" required />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', paddingBottom: 10 }}>
                  <input type="checkbox" name="bestSeller" checked={form.bestSeller} onChange={handleFormChange} />
                  Best Seller
                </label>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn-primary" disabled={uploading} style={{ opacity: uploading ? 0.7 : 1 }}>
                  {uploading ? '⏳ Uploading...' : editingId !== null ? 'Save Changes' : 'Add Product'}
                </button>
                {editingId !== null && (
                  <button type="button" className="tab-btn" onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setImageFile(null); setImagePreview(null); }}>Cancel</button>
                )}
              </div>
            </form>
          </div>

          {/* Product list */}
          <h3 style={{ fontFamily: 'Playfair Display', fontSize: 16, marginBottom: 12 }}>All Products ({state.products.length})</h3>
          {state.products.map((product) => (
            <div key={product.id} className="card" style={{ padding: '14px 20px', marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{product.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>
                    {product.category} • {product.length} • {product.color}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: 'var(--gold)', fontSize: 14 }}>{fmt(product.price)}</span>
                  {product.originalPrice && (
                    <span style={{ fontSize: 12, color: 'var(--text-light)', textDecoration: 'line-through' }}>{fmt(product.originalPrice)}</span>
                  )}
                  {product.bestSeller && <span className="badge badge-gold">Best Seller</span>}
                  <span className={`badge ${product.inStock ? 'badge-green' : 'badge-red'}`}>
                    {product.inStock ? `${product.stock} in stock` : 'Out of Stock'}
                  </span>
                  <button
                    className="tab-btn"
                    style={{ fontSize: 12, padding: '4px 12px' }}
                    onClick={() => {
                      setPricingId(pricingId === product.id ? null : product.id);
                      setPriceForm({ price: product.price, originalPrice: product.originalPrice || '' });
                    }}
                  >Price</button>
                  <button
                    className="tab-btn"
                    style={{ fontSize: 12, padding: '4px 12px' }}
                    onClick={() => startEdit(product)}
                  >Edit</button>
                  <button
                    className="tab-btn"
                    style={{ fontSize: 12, padding: '4px 12px', color: '#c0392b', borderColor: '#c0392b' }}
                    onClick={async () => {
                      if (window.confirm(`Delete "${product.name}"?`)) {
                        try {
                          await deleteProduct(product.id);
                          dispatch({ type: 'DELETE_PRODUCT', payload: product.id });
                          dispatch({ type: 'SET_TOAST', payload: { msg: 'Product deleted', icon: '🗑️' } });
                        } catch {
                          dispatch({ type: 'SET_TOAST', payload: { msg: 'Failed to delete product', icon: '❌' } });
                        }
                      }
                    }}
                  >Delete</button>
                </div>
              </div>

              {/* Inline price editor */}
              {pricingId === product.id && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-light)', display: 'block', marginBottom: 4 }}>Selling Price (₦)</label>
                    <input
                      className="input-field"
                      type="number"
                      min={0}
                      style={{ width: 140, padding: '7px 10px', fontSize: 13 }}
                      value={priceForm.price}
                      onChange={(e) => setPriceForm((f) => ({ ...f, price: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-light)', display: 'block', marginBottom: 4 }}>Original / Was Price (₦) — leave blank to remove sale tag</label>
                    <input
                      className="input-field"
                      type="number"
                      min={0}
                      placeholder="e.g. 55000"
                      style={{ width: 210, padding: '7px 10px', fontSize: 13 }}
                      value={priceForm.originalPrice}
                      onChange={(e) => setPriceForm((f) => ({ ...f, originalPrice: e.target.value }))}
                    />
                  </div>
                  <button
                    className="btn-primary"
                    style={{ padding: '8px 20px', fontSize: 13 }}
                    onClick={async () => {
                      try {
                        const updated = await updateProduct(product.id, {
                          ...product,
                          price: Number(priceForm.price),
                          originalPrice: priceForm.originalPrice ? Number(priceForm.originalPrice) : null,
                        });
                        dispatch({ type: 'EDIT_PRODUCT', payload: updated });
                        dispatch({ type: 'SET_TOAST', payload: { msg: `Price updated to ${fmt(Number(priceForm.price))}`, icon: '💰' } });
                        setPricingId(null);
                      } catch {
                        dispatch({ type: 'SET_TOAST', payload: { msg: 'Failed to update price', icon: '❌' } });
                      }
                    }}
                  >Save Price</button>
                  <button className="tab-btn" style={{ fontSize: 13, padding: '8px 16px' }} onClick={() => setPricingId(null)}>Cancel</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Customers tab */}
      {tab === 'customers' && (() => {
        // Aggregate unique customers from orders
        const customerMap = {};
        state.orders.forEach((o) => {
          if (!o.customer?.email) return;
          const key = o.customer.email;
          if (!customerMap[key]) customerMap[key] = { name: o.customer.name, email: key, orders: 0, spent: 0 };
          customerMap[key].orders++;
          customerMap[key].spent += o.total;
        });
        const customers = Object.values(customerMap).sort((a, b) => b.spent - a.spent);
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: 17 }}>Customers ({customers.length})</h3>
              <div style={{ fontSize: 13, color: 'var(--text-light)' }}>
                Total revenue: <strong style={{ color: 'var(--gold)' }}>{fmt(customers.reduce((s, c) => s + c.spent, 0))}</strong>
              </div>
            </div>
            {customers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-light)', fontSize: 14 }}>
                No customer orders yet
              </div>
            ) : customers.map((c) => (
              <div key={c.email} className="card" style={{ padding: '16px 20px', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--blush)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👤</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{c.email}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--gold)', fontSize: 14 }}>{fmt(c.spent)}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{c.orders} order{c.orders !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Delivery Pricing tab */}
      {tab === 'delivery' && (
        <div>
          <div className="card" style={{ padding: 28, maxWidth: 520 }}>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: 17, marginBottom: 6 }}>Delivery Prices</h3>
            <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 24 }}>
              Set the delivery fee for each zone. Changes apply immediately to checkout.
            </p>
            {[
              { key: 'lagos',         label: 'Lagos (Same Day / Next Day)', desc: 'Uber Algorithm Pricing' },
              { key: 'nigeria',       label: 'Nigeria (GUO / GIGM Bus)',    desc: 'GIGM/GUO Bus Delivery'  },
              { key: 'international', label: 'International (DHL)',          desc: 'DHL Express + Duties'   },
            ].map(({ key, label, desc }) => {
              const current = deliveryForm?.[key] ?? state.delivery[key] ?? 0;
              return (
                <div key={key} style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 2 }}>{label}</label>
                  <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 8 }}>{desc}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, color: 'var(--text-mid)' }}>₦</span>
                    <input
                      className="input-field"
                      type="number"
                      min={0}
                      style={{ width: 160, padding: '8px 12px', fontSize: 14 }}
                      value={current}
                      onChange={(e) => setDeliveryForm((f) => ({ ...(f ?? state.delivery), [key]: e.target.value }))}
                    />
                    <span style={{ fontSize: 13, color: 'var(--text-light)' }}>
                      {current !== state.delivery[key] && deliveryForm ? `(was ${fmt(state.delivery[key])})` : fmt(Number(current))}
                    </span>
                  </div>
                </div>
              );
            })}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button
                className="btn-primary"
                style={{ padding: '10px 24px', opacity: deliverySaving ? 0.7 : 1 }}
                disabled={deliverySaving || !deliveryForm}
                onClick={async () => {
                  setDeliverySaving(true);
                  const fees = {
                    lagos:         Number(deliveryForm?.lagos         ?? state.delivery.lagos),
                    nigeria:       Number(deliveryForm?.nigeria       ?? state.delivery.nigeria),
                    international: Number(deliveryForm?.international ?? state.delivery.international),
                  };
                  try {
                    await saveDeliverySettings(fees);
                    dispatch({ type: 'SET_DELIVERY', payload: fees });
                    dispatch({ type: 'SET_TOAST', payload: { msg: 'Delivery prices updated!', icon: '🚚' } });
                    setDeliveryForm(null);
                  } catch {
                    dispatch({ type: 'SET_TOAST', payload: { msg: 'Failed to save delivery prices', icon: '❌' } });
                  }
                  setDeliverySaving(false);
                }}
              >{deliverySaving ? 'Saving...' : 'Save Delivery Prices'}</button>
              {deliveryForm && (
                <button className="tab-btn" style={{ padding: '10px 18px' }} onClick={() => setDeliveryForm(null)}>Reset</button>
              )}
            </div>
          </div>

          {/* Bank Details */}
          <div className="card" style={{ padding: 28, maxWidth: 520, marginTop: 24 }}>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: 17, marginBottom: 6 }}>Bank Transfer Details</h3>
            <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 24 }}>
              Shown to customers who choose Bank Transfer at checkout.
            </p>
            {[
              { key: 'bank_name', label: 'Bank Name', placeholder: 'e.g. Guaranty Trust Bank' },
              { key: 'bank_account', label: 'Account Number', placeholder: 'e.g. 0123456789' },
              { key: 'bank_account_name', label: 'Account Name', placeholder: 'e.g. Perrys Hairline Ltd' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>{label}</label>
                <input
                  className="input-field"
                  placeholder={placeholder}
                  value={bankForm?.[key] ?? state.bank[key] ?? ''}
                  onChange={(e) => setBankForm((f) => ({ ...(f ?? state.bank), [key]: e.target.value }))}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn-primary"
                style={{ padding: '10px 24px', opacity: bankSaving ? 0.7 : 1 }}
                disabled={bankSaving || !bankForm}
                onClick={async () => {
                  setBankSaving(true);
                  try {
                    await saveBankDetails(bankForm);
                    dispatch({ type: 'SET_BANK', payload: bankForm });
                    dispatch({ type: 'SET_TOAST', payload: { msg: 'Bank details updated!', icon: '🏦' } });
                    setBankForm(null);
                  } catch {
                    dispatch({ type: 'SET_TOAST', payload: { msg: 'Failed to save bank details', icon: '❌' } });
                  }
                  setBankSaving(false);
                }}
              >{bankSaving ? 'Saving...' : 'Save Bank Details'}</button>
              {bankForm && (
                <button className="tab-btn" style={{ padding: '10px 18px' }} onClick={() => setBankForm(null)}>Reset</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete order confirmation modal */}
      {confirmDeleteOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="card" style={{ padding: 32, maxWidth: 420, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: 20, marginBottom: 8 }}>Delete Order?</h3>
            <p style={{ color: 'var(--text-mid)', fontSize: 14, marginBottom: 6 }}>
              You are about to permanently delete:
            </p>
            <div style={{ background: 'var(--warm-white)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13 }}>
              <strong>{confirmDeleteOrder.id}</strong><br />
              <span style={{ color: 'var(--text-light)' }}>
                {confirmDeleteOrder.customer?.name || 'Guest'} · {fmt(confirmDeleteOrder.total)} · {confirmDeleteOrder.date}
              </span>
            </div>
            <p style={{ color: '#cc3333', fontSize: 13, marginBottom: 24 }}>This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="tab-btn" style={{ padding: '10px 24px' }} onClick={() => setConfirmDeleteOrder(null)}>Cancel</button>
              <button
                style={{ background: '#cc3333', color: 'white', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                onClick={async () => {
                  try {
                    await deleteOrder(confirmDeleteOrder.id);
                    // Re-fetch from backend so all stats are in sync
                    const fresh = await fetchOrders(state.user.id, true);
                    dispatch({ type: 'SET_ORDERS', payload: fresh });
                    dispatch({ type: 'SET_TOAST', payload: { msg: 'Order deleted', icon: '🗑️' } });
                  } catch {
                    dispatch({ type: 'SET_TOAST', payload: { msg: 'Failed to delete order', icon: '❌' } });
                  }
                  setConfirmDeleteOrder(null);
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
