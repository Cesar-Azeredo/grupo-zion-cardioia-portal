import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth.js'

// Sem usuário: manda para /login guardando a rota de origem em state.from,
// para o Login devolver o usuário à página que ele tentou abrir.
export function ProtectedRoute({ children }) {
  const { usuario } = useAuth()
  const location = useLocation()

  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children ?? <Outlet />
}
