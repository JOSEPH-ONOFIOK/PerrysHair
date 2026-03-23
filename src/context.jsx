import { createContext, useReducer, useEffect, useRef } from 'react';
import { supabase, fetchProducts, fetchOrders, fetchProfile, fetchDeliverySettings, fetchBankDetails, fetchCart, syncCart, DEFAULT_DELIVERY, DEFAULT_BANK } from './supabase.js';

export const AppContext = createContext(null);

const initialState = {
  user: null,
  cart: [],
  orders: [],
  products: [],
  delivery: DEFAULT_DELIVERY,
  bank: DEFAULT_BANK,
  view: 'home',
  selectedProduct: null,
  selectedOrder: null,
  toast: null,
  authMode: 'login',
  adminTab: 'orders',
  loading: true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, view: action.payload };
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
      const exists = state.cart.find((i) => i.id === action.payload.id);
      if (exists)
        return {
          ...state,
          cart: state.cart.map((i) =>
            i.id === action.payload.id ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      return { ...state, cart: [...state.cart, { ...action.payload, qty: 1 }] };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter((i) => i.id !== action.payload) };
    case 'UPDATE_QTY':
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

  // Load products and delivery settings on mount
  useEffect(() => {
    fetchDeliverySettings().then((fees) => dispatch({ type: 'SET_DELIVERY', payload: fees }));
    fetchBankDetails().then((bank) => dispatch({ type: 'SET_BANK', payload: bank }));
    fetchProducts()
      .then((products) => dispatch({ type: 'SET_PRODUCTS', payload: products }))
      .catch(() => dispatch({ type: 'SET_LOADING', payload: false }));
  }, []);

  // Listen to Supabase auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadUser(session.user);
      else dispatch({ type: 'SET_LOADING', payload: false });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'PASSWORD_RECOVERY') {
        dispatch({ type: 'SET_VIEW', payload: 'reset-password' });
        return;
      }
      if (session?.user) {
        loadUser(session.user);
        if (_event === 'SIGNED_IN' && localStorage.getItem('perrys_awaiting_confirm')) {
          localStorage.removeItem('perrys_awaiting_confirm');
          dispatch({ type: 'SET_TOAST', payload: { msg: 'Registration complete! Welcome to Perrys Hairline', icon: '✨' } });
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    });

    return () => subscription.unsubscribe();
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
      const [orders, savedCart] = await Promise.all([
        fetchOrders(authUser.id, profile.is_admin),
        fetchCart(authUser.id),
      ]);
      dispatch({ type: 'SET_ORDERS', payload: orders });
      if (savedCart.length) dispatch({ type: 'SET_CART', payload: savedCart });
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
