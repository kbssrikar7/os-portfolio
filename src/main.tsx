import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/ubuntu-sans';
import '@fontsource-variable/ubuntu-sans-mono';
import './styles/base.css';
import './styles/shell.css';
import './styles/apps.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
