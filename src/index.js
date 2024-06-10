import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <GoogleOAuthProvider clientId="1067794504090-5uaclt9g715islhrped711o814um4e7b.apps.googleusercontent.com">
     <App />
     </GoogleOAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

