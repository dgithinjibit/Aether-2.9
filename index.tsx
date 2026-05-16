import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Suppress benign ResizeObserver error
const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && /ResizeObserver loop completed with undelivered notifications/.test(args[0])) {
    return;
  }
  originalError.call(console, ...args);
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);