import { createContext, useReducer } from 'react';
import { SAMPLE_ORDERS, HAIR_PRODUCTS } from './data.js';

export const AppContext = createContext(null);

const initialState = {
  user: null,
  cart: [],
  orders: SAMPLE_ORDERS,
  products: HAIR_PRODUCTS,
  view: 'home',
  selectedProduct: null,
  selectedOrder: null,
  toast: null,
  authMode: 'login',
  adminTab: 'orders',
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, view: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, view: 'home', cart: [] };
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
      const newOrder = {
        id: `PHR-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        items: state.cart,
        total: action.payload.total,
        status: 0,
        delivery: action.payload.delivery,
        tracking: `PHR${Math.floor(Math.random() * 9000000 + 1000000)}`,
        customer: action.payload.customer,
      };
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
    case 'ADD_PRODUCT': {
      const newProduct = { ...action.payload, id: Date.now(), rating: 0, reviews: 0 };
      return { ...state, products: [newProduct, ...state.products] };
    }
    case 'EDIT_PRODUCT':
      return {
        ...state,
        products: state.products.map((p) => p.id === action.payload.id ? action.payload : p),
      };
    case 'DELETE_PRODUCT':
      return { ...state, products: state.products.filter((p) => p.id !== action.payload) };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
