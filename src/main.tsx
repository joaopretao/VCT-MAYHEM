import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

declare global {
  interface Window {
    __VCT_MAYHEM_MOUNTED__?: boolean;
  }
}

const rootEl = document.getElementById('root');
if (rootEl && !window.__VCT_MAYHEM_MOUNTED__) {
  window.__VCT_MAYHEM_MOUNTED__ = true;
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
