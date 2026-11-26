import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import './design/tokens.css';
import './design/global.css';
import App from './App.jsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('App render error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '36px',
            maxWidth: 560,
            margin: '48px auto',
            background: '#111833',
            color: '#F8FAFC',
            borderRadius: 24,
            border: '1px solid rgba(203, 185, 255, 0.35)',
            boxShadow: '0 20px 50px rgba(4, 7, 18, 0.55)',
          }}
        >
          <h2 style={{ color: '#D9FF00', marginTop: 0 }}>Something went wrong</h2>
          <pre
            style={{
              background: '#0B1021',
              color: '#EBE4FF',
              padding: 14,
              borderRadius: 12,
              overflowX: 'auto',
              fontSize: 14,
              border: '1px solid rgba(203, 185, 255, 0.2)',
            }}
          >
            {this.state.error?.message || String(this.state.error)}
          </pre>
          <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
