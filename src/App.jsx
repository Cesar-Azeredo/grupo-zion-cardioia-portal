import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { PatientsProvider } from './contexts/PatientsProvider.jsx'
import { Agendamento } from './pages/Agendamento.jsx'
import { Dashboard } from './pages/Dashboard.jsx'
import { Login } from './pages/Login.jsx'
import { Pacientes } from './pages/Pacientes.jsx'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {/* Tudo abaixo exige usuário logado. O PatientsProvider fica aqui (e não
          em main.jsx) para buscar a lista só depois do login, uma vez por sessão:
          ele continua montado enquanto se navega entre as páginas filhas. */}
      <Route
        element={
          <ProtectedRoute>
            <PatientsProvider>
              <Layout />
            </PatientsProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pacientes" element={<Pacientes />} />
        <Route path="agendamento" element={<Agendamento />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
