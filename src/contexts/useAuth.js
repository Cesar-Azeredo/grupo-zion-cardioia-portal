import { useContext } from 'react'
import { AuthContext } from './AuthContext.js'

export function useAuth() {
  const valor = useContext(AuthContext)
  if (valor === null) {
    throw new Error('useAuth() precisa estar dentro de <AuthProvider>. Envolva a aplicação com o provider em main.jsx.')
  }
  return valor
}
