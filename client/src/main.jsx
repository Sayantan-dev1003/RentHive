import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './Stylesheets/index.css'
import './Stylesheets/erode.css'
import App from './App.jsx'
import { AuthProvider } from './Context/AuthContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)