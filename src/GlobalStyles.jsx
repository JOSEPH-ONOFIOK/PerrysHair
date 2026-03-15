const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --cream: #FDF0F5;
      --warm-white: #FFF5F9;
      --gold: #C9973A;
      --gold-light: #E8C07A;
      --gold-dark: #9B6E1A;
      --espresso: #2A1020;
      --brown-mid: #5C2040;
      --brown-light: #9A6070;
      --blush: #F7C8D8;
      --blush-dark: #D4809A;
      --text-dark: #2A1020;
      --text-mid: #7A3055;
      --text-light: #B07090;
      --border: #F0D0DF;
      --success: #4CAF7D;
      --error: #E05252;
      --shadow-sm: 0 2px 8px rgba(180,60,100,0.08);
      --shadow-md: 0 8px 32px rgba(180,60,100,0.12);
      --shadow-lg: 0 20px 60px rgba(180,60,100,0.16);
    }
    body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--text-dark); overflow-x: hidden; }
    h1,h2,h3,h4,h5 { font-family: 'Playfair Display', serif; }
    p, .section-subtitle { font-family: 'Cormorant Garamond', serif; letter-spacing: 0.01em; }
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

    .section-title { font-size: clamp(28px, 4vw, 42px); color: var(--espresso); line-height: 1.2; font-style: italic; }
    .section-subtitle { font-size: 17px; color: var(--text-light); font-family: 'Cormorant Garamond', serif; font-weight: 400; letter-spacing: 0.03em; }

    .tab-btn {
      padding: 8px 20px; border-radius: 20px; font-size: 13px; font-weight: 500;
      background: transparent; color: var(--text-mid); transition: all 0.2s; border: none; cursor: pointer;
      white-space: nowrap;
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

    /* Mobile menu */
    .mobile-menu-btn { display: none; }
    .mobile-nav {
      display: none; position: absolute; top: 64px; left: 0; right: 0;
      background: rgba(250,247,242,0.98); backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--border); padding: 16px 24px 20px;
      flex-direction: column; gap: 4px; z-index: 99;
      animation: slideDown 0.2s ease;
    }
    .mobile-nav.open { display: flex; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
    .mobile-nav .nav-link { padding: 12px 16px; font-size: 15px; border-radius: 8px; text-align: left; width: 100%; }
    .mobile-nav .nav-link:hover { background: var(--blush); color: var(--gold); }
    .mobile-nav-divider { height: 1px; background: var(--border); margin: 8px 0; }

    /* Utility */
    .hide-mobile { display: revert; }
    .show-mobile { display: none; }

    /* ── Responsive ────────────────────────────────────────────────────────────── */

    /* Tablet (≤ 900px) */
    @media(max-width: 900px) {
      .admin-history-grid { grid-template-columns: 1fr !important; }
    }

    /* Mobile (≤ 768px) */
    @media(max-width: 768px) {
      .hide-mobile { display: none !important; }
      .show-mobile { display: flex !important; }
      .mobile-menu-btn { display: flex; }

      /* Grids */
      .checkout-grid { grid-template-columns: 1fr !important; }
      .product-grid  { grid-template-columns: 1fr !important; }
      .hero-grid     { grid-template-columns: 1fr !important; }
      .cart-grid     { grid-template-columns: 1fr !important; }
      .admin-stats   { grid-template-columns: repeat(2, 1fr) !important; }

      /* Admin tabs — horizontal scroll instead of overflow */
      .admin-tabs {
        overflow-x: auto !important;
        flex-wrap: nowrap !important;
        padding-bottom: 6px;
        -webkit-overflow-scrolling: touch;
      }
      .admin-tabs::-webkit-scrollbar { height: 3px; }
      .admin-tabs::-webkit-scrollbar-thumb { background: var(--blush-dark); border-radius: 2px; }

      /* Toast full-width on mobile */
      .toast { right: 12px; left: 12px; max-width: calc(100% - 24px); bottom: 16px; }

      /* Navbar height / padding */
      nav { padding: 0 16px !important; }

      /* Page padding */
      .page-pad { padding-left: 16px !important; padding-right: 16px !important; }

      /* Product detail info layout */
      .product-grid > div:first-child { padding: 24px !important; }

      /* Cart item wrapping */
      .cart-item-row { flex-wrap: wrap !important; }

      /* Checkout steps compact */
      .step-label { display: none; }

      /* Admin dashboard padding */
      .admin-header { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
    }

    /* Small mobile (≤ 480px) */
    @media(max-width: 480px) {
      .admin-stats { grid-template-columns: 1fr 1fr !important; }
      .btn-primary, .btn-outline, .btn-dark { padding: 11px 20px !important; font-size: 13px !important; }
      .modal-box { border-radius: 12px; }
      .section-title { font-size: clamp(24px, 7vw, 32px) !important; }
      .hero-cta-btns { flex-direction: column !important; }
      .hero-cta-btns .btn-outline { display: none; }
    }
  `}</style>
);

export default GlobalStyles;
