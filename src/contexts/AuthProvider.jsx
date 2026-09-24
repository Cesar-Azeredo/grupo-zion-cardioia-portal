import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext.js'
import { autenticar } from '../services/authService.js'
import { validarToken } from '../services/jwtFake.js'
import { gravarTexto, lerTexto, remover } from '../services/storage.js'

export const CHAVE_TOKEN = 'cardioia.auth.token.v1'

// Lê e valida o token gravado. Token malformado, adulterado ou expirado é
// apagado e o usuário começa deslogado.
function carregarSessao() {
  const token = lerTexto(CHAVE_TOKEN)
  if (!token) return null
  const payload = validarToken(token)
  if (!payload) remover(CHAVE_TOKEN)
  return payload
}

export function AuthProvider({ children }) {
  // Inicialização preguiçosa: a validação acontece antes do primeiro render,
  // então o ProtectedRoute nunca vê um "deslogado" falso durante a carga.
  const [usuario, setUsuario] = useState(carregarSessao)

  const logout = useCallback(() => {
    remover(CHAVE_TOKEN)
    setUsuario(null)
  }, [])

  const login = useCallback((email, senha) => {
    const token = autenticar(email, senha)
    if (!token) return false
    gravarTexto(CHAVE_TOKEN, token)
    setUsuario(validarToken(token))
    return true
  }, [])

  // Sessão expira sozinha: agenda o logout para o instante do exp.
  useEffect(() => {
    if (!usuario) return undefined
    const restanteMs = usuario.exp * 1000 - Date.now()
    const id = setTimeout(logout, Math.max(restanteMs, 0))
    return () => clearTimeout(id)
  }, [usuario, logout])

  const valor = useMemo(() => ({ usuario, login, logout }), [usuario, login, logout])

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
