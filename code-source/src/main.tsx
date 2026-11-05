import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { bootData } from './services/store';
import './styles/global.css';

bootData().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
