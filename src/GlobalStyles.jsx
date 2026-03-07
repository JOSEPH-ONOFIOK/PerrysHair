const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --cream: #FAF7F2;
      --warm-white: #FFF9F0;
      --gold: #C9973A;
      --gold-light: #E8C07A;
      --gold-dark: #9B6E1A;
      --espresso: #1A1008;
      --brown-mid: #3D2010;
      --brown-light: #7A4F2D;
      --blush: #F2D5C0;
      --blush-dark: #D4A882;
      --text-dark: #1A1008;
      --text-mid: #5C3D22;
      --text-light: #9A7A5C;
      --border: #E8DDD0;
      --success: #4CAF7D;
      --error: #E05252;
      --shadow-sm: 0 2px 8px rgba(26,16,8,0.08);
      --shadow-md: 0 8px 32px rgba(26,16,8,0.12);
      --shadow-lg: 0 20px 60px rgba(26,16,8,0.18);
    }
    body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--text-dark); overflow-x: hidden; }
    h1,h2,h3,h4,h5 { font-family: 'Playfair Display', serif; }
    button { font-family: 'DM Sans', sans-serif; cursor: pointer; border: none; outline: none; }
    input, select, textarea { font-family: 'DM Sans', sans-serif; outline: none; }
    a { text-decoration: none; color: inherit; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--cream); }
    ::-webkit-scrollbar-thumb { background: var(--blush-dark); border-radius: 3px; }

    .btn-primary {
      background: var(--gold); color: white; padding: 12px 28px; border-radius: 4px;
      font-weight: 600; font-size: 14px; letter-spacing: 0.5px; transition: all 0.2s;
      display: inline-flex; align-items: center; gap: 8px;
    }
    .btn-primary:hover { background: var(--gold-dark); transform: translateY(-1px); box-shadow: var(--shadow-md); }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

    .btn-outline {
      background: transparent; color: var(--gold); border: 1.5px solid var(--gold);
      padding: 11px 27px; border-radius: 4px; font-weight: 600; font-size: 14px; transition: all 0.2s;
    }
    .btn-outline:hover { background: var(--gold); color: white; }

    .btn-dark {
      background: var(--espresso); color: white; padding: 12px 28px;
      border-radius: 4px; font-weight: 600; font-size: 14px; transition: all 0.2s;
    }
    .btn-dark:hover { background: var(--brown-mid); }

    .input-field {
      width: 100%; padding: 12px 16px; border: 1.5px solid var(--border); border-radius: 6px;
      background: white; font-size: 14px; color: var(--text-dark); transition: border-color 0.2s;
    }
    .input-field:focus { border-color: var(--gold); }
    .input-field::placeholder { color: var(--text-light); }

    .card {
      background: white; border-radius: 12px; box-shadow: var(--shadow-sm);
      overflow: hidden; transition: all 0.3s;
    }
    .card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }

    .badge {
      display: inline-block; padding: 3px 10px; border-radius: 20px;
      font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;
    }
    .badge-gold { background: var(--gold); color: white; }
    .badge-blush { background: var(--blush); color: var(--brown-mid); }
    .badge-green { background: #E8F5EE; color: #2D7A51; }
    .badge-red { background: #FEE8E8; color: #C03030; }

    .modal-overlay {
      position: fixed; inset: 0; background: rgba(26,16,8,0.6); backdrop-filter: blur(4px);
      z-index: 1000; display: flex; align-items: center; justify-content: center;
      padding: 20px; animation: fadeIn 0.2s ease;
    }
    .modal-box {
      background: white; border-radius: 16px; box-shadow: var(--shadow-lg);
      width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto;
      animation: slideUp 0.3s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    .nav-link {
      padding: 6px 12px; border-radius: 4px; font-size: 14px; font-weight: 500;
      color: var(--text-mid); transition: all 0.2s; cursor: pointer; background: none; border: none;
    }
    .nav-link:hover, .nav-link.active { color: var(--gold); }

    .section-title { font-size: clamp(28px, 4vw, 42px); color: var(--espresso); line-height: 1.2; }
    .section-subtitle { font-size: 15px; color: var(--text-light); font-family: 'DM Sans', sans-serif; font-weight: 400; }

    .tab-btn {
      padding: 8px 20px; border-radius: 20px; font-size: 13px; font-weight: 500;
      background: transparent; color: var(--text-mid); transition: all 0.2s; border: none; cursor: pointer;
    }
    .tab-btn.active { background: var(--gold); color: white; }
    .tab-btn:hover:not(.active) { background: var(--blush); }

    .toast {
      position: fixed; bottom: 24px; right: 24px; background: var(--espresso); color: white;
      padding: 14px 20px; border-radius: 8px; font-size: 14px; font-weight: 500;
      box-shadow: var(--shadow-lg); z-index: 9999; animation: slideInRight 0.3s ease;
      display: flex; align-items: center; gap: 10px; max-width: 320px;
    }
    @keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }

    .progress-bar { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
    .progress-fill { height: 100%; background: var(--gold); border-radius: 2px; transition: width 0.5s ease; }

    .order-timeline { display: flex; flex-direction: column; gap: 0; }
    .order-step { display: flex; gap: 16px; position: relative; }
    .order-step:not(:last-child)::before {
      content: ''; position: absolute; left: 15px; top: 32px;
      width: 2px; height: calc(100% + 8px); background: var(--border);
    }
    .order-step.done::before { background: var(--gold); }
    .step-dot {
      width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center;
      justify-content: center; font-size: 13px; flex-shrink: 0;
      border: 2px solid var(--border); background: white; z-index: 1;
    }
    .step-dot.done { background: var(--gold); border-color: var(--gold); color: white; }
    .step-dot.active { background: white; border-color: var(--gold); color: var(--gold); }
    .step-info { padding-bottom: 24px; }

    @media(max-width: 768px) {
      .hide-mobile { display: none !important; }
      .checkout-grid { grid-template-columns: 1fr !important; }
      .product-grid { grid-template-columns: 1fr !important; }
      .hero-grid { grid-template-columns: 1fr !important; }
      .admin-stats { grid-template-columns: repeat(2, 1fr) !important; }
    }
  `}</style>
);

export default GlobalStyles;
