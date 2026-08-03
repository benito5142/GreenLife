import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign WebSocket/HMR disconnect messages in dev environment
if (typeof window !== 'undefined') {
  const originalError = console.error;
  const originalDebug = console.debug;
  const originalWarn = console.warn;
  const originalLog = console.log;

  const isWsError = (arg: any) => {
    if (!arg) return false;
    const str = String(arg?.message || arg?.reason || arg?.description || arg).toLowerCase();
    return str.includes('websocket') || str.includes('closed without opened') || str.includes('[vite]');
  };

  const isViteWsMsg = (args: any[]) => {
    return args.some((arg) => isWsError(arg));
  };

  console.error = (...args: any[]) => {
    if (isViteWsMsg(args)) return;
    originalError.apply(console, args);
  };

  console.debug = (...args: any[]) => {
    if (isViteWsMsg(args)) return;
    originalDebug.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    if (isViteWsMsg(args)) return;
    originalWarn.apply(console, args);
  };

  console.log = (...args: any[]) => {
    if (isViteWsMsg(args)) return;
    originalLog.apply(console, args);
  };

  window.addEventListener(
    'unhandledrejection',
    (event) => {
      if (isWsError(event.reason) || isWsError(event)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );

  window.addEventListener(
    'error',
    (event) => {
      if (isWsError(event.error) || isWsError(event.message) || isWsError(event)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

