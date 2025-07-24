import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Bootstrap JS imports
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Performance monitoring (optional)
if (process.env.NODE_ENV === 'development') {
  console.log('DriveZone Development Mode - Performance monitoring enabled');
}

// Error boundary for development
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handleError = (error) => {
      console.error('DriveZone Error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  if (hasError) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h1 style={{ color: '#dc3545', marginBottom: '1rem' }}>
          DriveZone - Bir Hata Oluştu
        </h1>
        <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
          Uygulama yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Sayfayı Yenile
        </button>
      </div>
    );
  }

  return children;
};

// App initialization
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Service Worker registration (optional for PWA)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('DriveZone SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('DriveZone SW registration failed: ', registrationError);
      });
  });
}

// Global error handler
window.addEventListener('error', (event) => {
  console.error('DriveZone Global Error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('DriveZone Unhandled Promise Rejection:', event.reason);
});

// Development helpers
if (process.env.NODE_ENV === 'development') {
  // Enable React DevTools
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {};
  
  // Add debugging helpers
  window.DriveZoneDebug = {
    version: '1.0.0',
    environment: 'development',
    clearStorage: () => {
      localStorage.clear();
      sessionStorage.clear();
      console.log('DriveZone storage cleared');
    },
    getStorageInfo: () => {
      console.log('LocalStorage:', localStorage);
      console.log('SessionStorage:', sessionStorage);
    }
  };
} 