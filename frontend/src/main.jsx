import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './auth.css'
import './i18n'; // Import i18n initialization
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

// Filter out and suppress noisy chrome extension message channel closed console warnings
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && (
    (event.reason.message && event.reason.message.includes('message channel closed before a response was received')) ||
    (event.reason.includes && event.reason.includes('message channel closed before a response was received'))
  )) {
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('message channel closed before a response was received')) {
    event.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
)
