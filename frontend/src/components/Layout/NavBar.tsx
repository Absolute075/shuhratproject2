import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

type NavItem = {
  to: string;
  label: string;
  className?: string;
};

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const rootRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isHome = location.pathname === '/';

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    const root = rootRef.current;
    const container = containerRef.current;
    if (!root || !container) return;

    const update = () => {
      const h = container.getBoundingClientRect().height;
      root.style.setProperty('--pp-nav-offset', `${Math.round(h)}px`);
    };

    update();

    if (typeof ResizeObserver === 'function') {
      const ro = new ResizeObserver(() => update());
      ro.observe(container);
      window.addEventListener('resize', update);
      return () => {
        ro.disconnect();
        window.removeEventListener('resize', update);
      };
    }

    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const items: NavItem[] = useMemo(
    () => [
      { to: '/features', label: 'Features' },
      { to: '/pricing', label: 'Pricing' },
      { to: '/contact', label: 'Contact' },
      { to: '/faq', label: 'FAQ' },
      { to: '/about', label: 'About' }
    ],
    []
  );

  return (
    <header
      ref={rootRef}
      role="banner"
      className={`pp-nav ${isHome ? 'pp-nav--home' : 'pp-nav--inner'}${open ? ' is-open' : ''}`}
    >
      <div ref={containerRef} className="pp-nav__container">
        <NavLink
          to="/"
          aria-current={location.pathname === '/' ? 'page' : undefined}
          className={({ isActive }) => `pp-nav__brand${isActive ? ' is-active' : ''}`}
          onClick={() => setOpen(false)}
        >
          <img
            src="https://cdn.prod.website-files.com/6924575d25f2c55da5fad02c/69256ce47b7ba6ed1ec52836_Logo%20no%20background%20(white%20edt).png"
            width={192}
            alt=""
          />
          <img
            src="https://cdn.prod.website-files.com/6924575d25f2c55da5fad02c/692820980ea7a37f5f7dcbb3_ChatGPT_Image_Nov_27__2025__02_56_48_PM-removebg-preview.png"
            width={92}
            alt=""
          />
        </NavLink>

        <nav role="navigation" className="pp-nav__menu">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) => {
                const base = `nav-link w-nav-link${it.className ? ` ${it.className}` : ''}`;
                return isActive ? `${base} w--current` : base;
              }}
              onClick={() => setOpen(false)}
            >
              {it.label}
            </NavLink>
          ))}
          <div className="bullet"></div>
          <NavLink
            to="/pricing"
            className={({ isActive }) => `navigation-button w-button${isActive ? ' w--current' : ''}`}
            onClick={() => setOpen(false)}
          >
            Get Started
          </NavLink>
        </nav>

        <button
          type="button"
          className="pp-nav__toggle"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setOpen((v) => !v);
            }
          }}
        >
          <span className="pp-nav__icon" aria-hidden="true"></span>
        </button>
      </div>
    </header>
  );
}
