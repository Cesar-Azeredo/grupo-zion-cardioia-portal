import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { AppointmentsProvider } from './contexts/AppointmentsProvider.jsx'
import { AuthProvider } from './contexts/AuthProvider.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* HashRouter: o GitHub Pages não reescreve rotas para o index.html.
        Justificativa em docs/arquitetura.md, seção 4. */}
    <HashRouter>
      <AuthProvider>
        <AppointmentsProvider>
          <App />
        </AppointmentsProvider>
      </AuthProvider>
    </HashRouter>
  </StrictMode>,
)
