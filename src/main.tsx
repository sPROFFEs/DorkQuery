import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import './i18n/i18n';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/hacklabs">
      <App />
    </BrowserRouter>
  </StrictMode>
);
