import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import SimpleApp from './SimpleApp.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './index.css';

// Use SimpleApp for now to debug issues, switch back to App when working
const AppToRender = SimpleApp;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppToRender />
    </ErrorBoundary>
  </React.StrictMode>
);
