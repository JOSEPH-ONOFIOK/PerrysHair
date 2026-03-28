import { createContext, useReducer, useEffect, useRef } from 'react';
import { supabase, fetchProducts, fetchOrders, fetchProfile, fetchDeliverySettings, fetchBankDetails, fetchCart, syncCart, fetchWishlist, addToWishlist, removeFromWishlist, DEFAULT_DELIVERY, DEFAULT_BANK } from './supabase.js';

export const AppContext = createContext(null);

const savedWishlist = (() => { try { return JSON.parse(localStorage.getItem('perrys_wishlist')) || []; } catch { return []; } })();
const savedCurrency = (() => { try { return JSON.parse(localStorage.getItem('perrys_currency')); } catch { return null; } })();
const DEFAULT_CURRENCY = { flag: '🇳🇬', country: 'Nigeria', code: 'NGN', symbol: '₦', label: 'Nigerian Naira' };

const initialState = {
  user: null,
  cart: [],
  orders: [],
  products: [],
  delivery: DEFAULT_DELIVERY,
  bank: DEFAULT_BANK,
  view: 'home',
  shopFilter: 'All',
  selectedProduct: null,
  selectedOrder: null,
  toast: null,
  authMode: 'login',
  adminTab: 'orders',
  loading: true,
  needsProductRefresh: false,
  wishlist: savedWishlist,
  recentlyViewed: [],
  currency: savedCurrency || DEFAULT_CURRENCY,
  exchangeRates: {},
  showRegionModal: !savedCurrency,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_CURRENCY':
      return { ...state, currency: action.payload, showRegionModal: false };
    case 'SET_RATES':
      return { ...state, exchangeRates: action.payload };
    case 'SET_REGION_MODAL':
      return { ...state, showRegionModal: action.payload };
    case 'SET_VIEW':
      return { ...state, view: action.payload };
    case 'SET_SHOP_FILTER':
      return { ...state, shopFilter: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, view: 'home', cart: [], orders: [] };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload, loading: false };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_DELIVERY':
      return { ...state, delivery: action.payload };
    case 'SET_BANK':
      return { ...state, bank: action.payload };
    case 'ADD_TO_CART': {
      if (!action.payload?.id) return state;
      const exists = state.cart.find((i) => i.id === action.payload.id);
      if (exists)
        return {
          ...state,
          cart: state.cart.map((i) =>
            i.id === action.payload.id ? { ...i, qty: Math.max(1, i.qty + 1) } : i
          ),
        };
      return { ...state, cart: [...state.cart, { ...action.payload, qty: 1 }] };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter((i) => i.id !== action.payload) };
    case 'UPDATE_QTY':
      if (action.payload.qty < 1) return state;
      return {
        ...state,
        cart: state.cart.map((i) =>
          i.id === action.payload.id ? { ...i, qty: action.payload.qty } : i
        ),
      };
    case 'SET_CART':
      return { ...state, cart: action.payload };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'SELECT_PRODUCT':
      return { ...state, selectedProduct: action.payload, view: 'product-detail' };
    case 'SELECT_ORDER':
      return { ...state, selectedOrder: action.payload, view: 'order-tracking' };
    case 'SET_AUTH_MODE':
      return { ...state, authMode: action.payload, view: 'auth' };
    case 'PLACE_ORDER': {
      const newOrder = action.payload;
      return {
        ...state,
        orders: [newOrder, ...state.orders],
        cart: [],
        view: 'order-tracking',
        selectedOrder: newOrder,
        needsProductRefresh: true,
      };
    }
    case 'SET_TOAST':
      return { ...state, toast: action.payload };
    case 'SET_ADMIN_TAB':
      return { ...state, adminTab: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [action.payload, ...state.products] };
    case 'EDIT_PRODUCT':
      return {
        ...state,
        products: state.products.map((p) => p.id === action.payload.id ? action.payload : p),
      };
    case 'DELETE_PRODUCT':
      return { ...state, products: state.products.filter((p) => p.id !== action.payload) };
    case 'UPDATE_PRODUCT_RATING':
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.id
            ? { ...p, rating: action.payload.avg, reviews: action.payload.count }
            : p
        ),
      };
    case 'DECREMENT_STOCK':
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.id
            ? { ...p, stock: Math.max(0, p.stock - action.payload.qty), inStock: Math.max(0, p.stock - action.payload.qty) > 0 }
            : p
        ),
      };
    case 'TOGGLE_WISHLIST': {
      const inList = state.wishlist.some((p) => p.id === action.payload.id);
      const wishlist = inList
        ? state.wishlist.filter((p) => p.id !== action.payload.id)
        : [action.payload, ...state.wishlist];
      try { localStorage.setItem('perrys_wishlist', JSON.stringify(wishlist)); } catch {}
      return { ...state, wishlist, _wishlistToggle: { product: action.payload, removed: inList } };
    }
    case 'MERGE_WISHLIST': {
      // Merge remote wishlist IDs with local products list (products may not be loaded yet — handled by effect)
      return { ...state, _pendingWishlistIds: action.payload.remoteIds };
    }
    case 'RESOLVE_WISHLIST': {
      try { localStorage.setItem('perrys_wishlist', JSON.stringify(action.payload)); } catch {}
      return { ...state, wishlist: action.payload, _pendingWishlistIds: null };
    }
    case 'ADD_RECENTLY_VIEWED': {
      const prev = state.recentlyViewed.filter((p) => p.id !== action.payload.id);
      return { ...state, recentlyViewed: [action.payload, ...prev].slice(0, 12) };
    }
    case 'DELETE_ORDER':
      return { ...state, orders: state.orders.filter((o) => o.id !== action.payload) };
    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.payload.id ? { ...o, status: action.payload.status } : o
        ),
      };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Fetch live exchange rates (base NGN)
  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/NGN')
      .then((r) => r.json())
      .then((data) => { if (data.rates) dispatch({ type: 'SET_RATES', payload: data.rates }); })
      .catch(() => {});
  }, []);

  // Load products and delivery settings on mount
  useEffect(() => {
    fetchDeliverySettings().then((fees) => dispatch({ type: 'SET_DELIVERY', payload: fees }));
    fetchBankDetails().then((bank) => dispatch({ type: 'SET_BANK', payload: bank }));
    fetchProducts()
      .then((products) => dispatch({ type: 'SET_PRODUCTS', payload: products }))
      .catch(() => dispatch({ type: 'SET_LOADING', payload: false }));
  }, []);

  // Re-fetch products after an order to sync real stock from DB
  useEffect(() => {
    if (!state.needsProductRefresh) return;
    fetchProducts()
      .then((products) => dispatch({ type: 'SET_PRODUCTS', payload: products }))
      .catch(() => {});
  }, [state.needsProductRefresh]);

  // Listen to Supabase auth state changes
  useEffect(() => {
    // If the URL hash contains type=recovery, show reset screen immediately
    // and skip normal session loading so we don't redirect to home
    const isRecovery = window.location.hash.includes('type=recovery');

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isRecovery) {
        dispatch({ type: 'SET_VIEW', payload: 'reset-password' });
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      if (session?.user) loadUser(session.user);
      else dispatch({ type: 'SET_LOADING', payload: false });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'PASSWORD_RECOVERY') {
        dispatch({ type: 'SET_VIEW', payload: 'reset-password' });
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      if (session?.user) {
        if (_event === 'SIGNED_IN') {
          localStorage.setItem('perrys_login_time', Date.now().toString());
          if (localStorage.getItem('perrys_awaiting_confirm')) {
            localStorage.removeItem('perrys_awaiting_confirm');
            dispatch({ type: 'SET_TOAST', payload: { msg: 'Registration complete! Welcome to Perrys Hairline', icon: '✨' } });
          }
        }
        if (!isRecovery) loadUser(session.user);
      } else {
        localStorage.removeItem('perrys_login_time');
        dispatch({ type: 'LOGOUT' });
      }
    });

    // Check every minute — sign out if session is older than 1 hour
    const SESSION_LIMIT = 60 * 60 * 1000;
    const sessionTimer = setInterval(async () => {
      const loginTime = localStorage.getItem('perrys_login_time');
      if (loginTime && Date.now() - Number(loginTime) > SESSION_LIMIT) {
        await supabase.auth.signOut();
        dispatch({ type: 'SET_TOAST', payload: { msg: 'Your session has expired. Please sign in again.', icon: '🔒' } });
      }
    }, 60 * 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(sessionTimer);
    };
  }, []);

  async function loadUser(authUser) {
    try {
      const profile = await fetchProfile(authUser.id);
      dispatch({
        type: 'SET_USER',
        payload: {
          id: authUser.id,
          name: profile.name || authUser.email.split('@')[0],
          email: authUser.email,
          isAdmin: profile.is_admin,
        },
      });
      const [orders, savedCart, remoteWishlistIds] = await Promise.all([
        fetchOrders(authUser.id, profile.is_admin),
        fetchCart(authUser.id),
        fetchWishlist(authUser.id).catch(() => []),
      ]);
      dispatch({ type: 'SET_ORDERS', payload: orders });
      if (savedCart.length) dispatch({ type: 'SET_CART', payload: savedCart });
      if (remoteWishlistIds.length) {
        dispatch({ type: 'MERGE_WISHLIST', payload: { remoteIds: remoteWishlistIds, userId: authUser.id } });
      }
    } catch {
      dispatch({
        type: 'SET_USER',
        payload: {
          id: authUser.id,
          name: authUser.user_metadata?.name || authUser.email.split('@')[0],
          email: authUser.email,
          isAdmin: false,
        },
      });
    }
  }

  // Resolve remote wishlist IDs → full product objects once products are loaded
  useEffect(() => {
    if (!state._pendingWishlistIds || state.loading || !state.products.length) return;
    const resolved = state._pendingWishlistIds
      .map((id) => state.products.find((p) => p.id === id))
      .filter(Boolean);
    // Merge with any locally saved items the user added while logged out
    const local = state.wishlist.filter((p) => !resolved.some((r) => r.id === p.id));
    dispatch({ type: 'RESOLVE_WISHLIST', payload: [...resolved, ...local] });
  }, [state._pendingWishlistIds, state.loading, state.products]);

  // Sync individual wishlist toggle to Supabase (logged-in users only)
  const wishlistSyncRef = useRef(false);
  useEffect(() => {
    if (!wishlistSyncRef.current) { wishlistSyncRef.current = true; return; }
    if (!state.user?.id || !state._wishlistToggle) return;
    const { product, removed } = state._wishlistToggle;
    if (removed) {
      removeFromWishlist(state.user.id, product.id).catch(() => {});
    } else {
      addToWishlist(state.user.id, product.id).catch(() => {});
    }
  }, [state._wishlistToggle]);

  // Sync cart to DB whenever it changes (logged-in users only)
  // Debounced to prevent race conditions on rapid cart updates
  const cartInitialized = useRef(false);
  const cartSyncTimeout = useRef(null);
  useEffect(() => {
    if (!cartInitialized.current) { cartInitialized.current = true; return; }
    if (!state.user?.id) return;
    if (cartSyncTimeout.current) clearTimeout(cartSyncTimeout.current);
    cartSyncTimeout.current = setTimeout(() => {
      syncCart(state.user.id, state.cart);
    }, 500);
    return () => clearTimeout(cartSyncTimeout.current);
  }, [state.cart, state.user?.id]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
