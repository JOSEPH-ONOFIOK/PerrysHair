import { useContext } from 'react';
import { AppContext } from '../context.jsx';

export function useCurrency() {
  const { state, dispatch } = useContext(AppContext);
  const { code, symbol } = state.currency;
  const rates = state.exchangeRates;

  const fmtPrice = (ngnAmount) => {
    if (ngnAmount == null || isNaN(ngnAmount)) return '—';
    const rate = rates[code] ?? (code === 'NGN' ? 1 : null);
    const amount = rate != null ? ngnAmount * rate : ngnAmount;
    try {
      return new Intl.NumberFormat('en', {
        style: 'currency', currency: code,
        minimumFractionDigits: 0, maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${symbol}${Math.round(amount).toLocaleString()}`;
    }
  };

  const setCurrency = (currencyObj) => dispatch({ type: 'SET_CURRENCY', payload: currencyObj });

  return { currency: state.currency, fmtPrice, setCurrency, ratesLoaded: Object.keys(rates).length > 0 };
}
