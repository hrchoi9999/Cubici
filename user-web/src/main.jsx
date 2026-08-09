import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/final-ui-foundation.css';
import './styles/user-web.css';

const BUILD_VERSION = 'lv-240130-main-20260807-1';
document.documentElement.dataset.cubiciBuild = BUILD_VERSION;

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
