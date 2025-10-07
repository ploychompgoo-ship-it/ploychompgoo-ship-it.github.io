import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import SimpleApp from './SimpleApp.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './index.css';

// Use App (full dashboard) now that basic functionality is working
const AppToRender = App;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppToRender />
    </ErrorBoundary>
  </React.StrictMode>
);
