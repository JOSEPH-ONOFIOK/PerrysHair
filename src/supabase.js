import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Helpers ───────────────────────────────────────────────────────────────────

function mapProduct(p) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    originalPrice: p.original_price,
    rating: p.rating,
    reviews: p.reviews,
    bestSeller: p.best_seller,
    inStock: p.in_stock,
    length: p.length,
    color: p.color,
    description: p.description,
    image: p.image,
  };
}

function mapOrder(o) {
  return {
    id: o.id,
    date: o.date,
    total: o.total,
    status: o.status,
    delivery: o.delivery,
    tracking: o.tracking,
    customer: o.customer_name ? { name: o.customer_name, email: o.customer_email } : null,
    items: (o.order_items || []).map((i) => ({
      id: i.product_id,
      name: i.product_name,
      price: i.product_price,
      qty: i.qty,
    })),
  };
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function signUp(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  });
  if (error) throw error;
}

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data.map(mapProduct);
}

export async function insertProduct(product) {
  const { data, error } = await supabase
    .from('products')
    .insert([{
      name: product.name,
      category: product.category,
      price: product.price,
      original_price: product.originalPrice || null,
      best_seller: product.bestSeller,
      in_stock: product.inStock,
      length: product.length,
      color: product.color,
      description: product.description,
      image: product.image,
      rating: 0,
      reviews: 0,
    }])
    .select()
    .single();
  if (error) throw error;
  return mapProduct(data);
}

export async function updateProduct(id, product) {
  const { data, error } = await supabase
    .from('products')
    .update({
      name: product.name,
      category: product.category,
      price: product.price,
      original_price: product.originalPrice || null,
      best_seller: product.bestSeller,
      in_stock: product.inStock,
      length: product.length,
      color: product.color,
      description: product.description,
      image: product.image,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapProduct(data);
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function fetchOrders(userId, isAdmin = false) {
  let query = supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });
  if (!isAdmin) query = query.eq('user_id', userId);
  const { data, error } = await query;
  if (error) throw error;
  return data.map(mapOrder);
}

export async function insertOrder(order, userId) {
  const { error: orderError } = await supabase.from('orders').insert([{
    id: order.id,
    user_id: userId,
    date: order.date,
    total: order.total,
    status: order.status,
    delivery: order.delivery,
    tracking: order.tracking,
    customer_name: order.customer?.name,
    customer_email: order.customer?.email,
  }]);
  if (orderError) throw orderError;

  if (order.items?.length) {
    const items = order.items.map((i) => ({
      order_id: order.id,
      product_id: i.id,
      product_name: i.name,
      product_price: i.price,
      qty: i.qty,
    }));
    const { error: itemsError } = await supabase.from('order_items').insert(items);
    if (itemsError) throw itemsError;
  }
}

export async function updateOrderStatus(orderId, status) {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);
  if (error) throw error;
}

// ── Delivery Settings ─────────────────────────────────────────────────────────

export const DEFAULT_DELIVERY = {
  lagos: 2500,
  nigeria: 5000,
  international: 35000,
};

export async function fetchDeliverySettings() {
  const { data, error } = await supabase.from('settings').select('*');
  if (error) return DEFAULT_DELIVERY;
  const result = { ...DEFAULT_DELIVERY };
  data.forEach(({ key, value }) => {
    if (key in result) result[key] = Number(value);
  });
  return result;
}

export async function saveDeliverySettings(fees) {
  const rows = Object.entries(fees).map(([key, value]) => ({ key, value: String(value) }));
  const { error } = await supabase
    .from('settings')
    .upsert(rows, { onConflict: 'key' });
  if (error) throw error;
}

// ── Product Image Upload ──────────────────────────────────────────────────────

export async function uploadProductImage(file) {
  const ext = file.name.split('.').pop();
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from('product-images')
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return data.publicUrl;
}
