import { useContext, useEffect } from 'react';
import { AppContext } from '../context.jsx';

export default function Toast() {
  const { state, dispatch } = useContext(AppContext);

  useEffect(() => {
    if (state.toast) {
      const t = setTimeout(() => dispatch({ type: 'SET_TOAST', payload: null }), 3500);
      return () => clearTimeout(t);
    }
  }, [state.toast]);

  if (!state.toast) return null;

  return (
    <div className="toast">
      <span style={{ fontSize: 18 }}>{state.toast.icon}</span>
      <span>{state.toast.msg}</span>
    </div>
  );
}
