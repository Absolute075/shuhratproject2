import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Footer from './Footer';
import NavBar from './NavBar';

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const showGlobalNav = !['/', '/features', '/pricing', '/contact', '/about', '/faq', '/privacyterms'].includes(
    location.pathname
  );

  useEffect(() => {
    const hash = location.hash ? decodeURIComponent(location.hash.replace('#', '')) : '';

    const scroll = () => {
      if (hash) {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView();
          return;
        }
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };

    const t = window.setTimeout(scroll, 0);
    return () => window.clearTimeout(t);
  }, [location.pathname, location.hash]);

  return (
    <>
      {showGlobalNav ? <NavBar /> : null}
      {children}
      <Footer />
    </>
  );
}
