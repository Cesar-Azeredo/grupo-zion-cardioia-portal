import { createContext } from 'react'

// Valor: { usuario, login(email, senha) => boolean, logout() }.
// O provider está em AuthProvider.jsx e o acesso em useAuth.js.
export const AuthContext = createContext(null)
