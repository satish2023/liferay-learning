import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class MyReactExtension extends HTMLElement {
  connectedCallback() {
    const root = createRoot(this);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}

if (!customElements.get('my-react-extension')) {
  customElements.define('my-react-extension', MyReactExtension);
}

