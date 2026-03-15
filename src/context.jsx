import { createContext, useReducer, useEffect } from 'react';
import { supabase, fetchProducts, fetchOrders, fetchProfile, fetchDeliverySettings, DEFAULT_DELIVERY } from './supabase.js';

export const AppContext = createContext(null);

const initialState = {
  user: null,
  cart: [],
  orders: [],
  products: [],
  delivery: DEFAULT_DELIVERY,
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
      if (session?.user) {
        loadUser(session.user);
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
      const orders = await fetchOrders(authUser.id, profile.is_admin);
      dispatch({ type: 'SET_ORDERS', payload: orders });
    } catch {
      // Profile may not exist yet right after signup
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

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
