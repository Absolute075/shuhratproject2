import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/overrides.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  const stray = Array.from(document.querySelectorAll('.navigation')) as HTMLElement[];
  for (const el of stray) {
    if (!rootEl.contains(el)) {
      el.remove();
    }
  }
}

ReactDOM.createRoot(rootEl!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
