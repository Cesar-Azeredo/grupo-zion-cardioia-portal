import { render, renderHook, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { gerarToken } from '../services/jwtFake.js'
import { AuthProvider, CHAVE_TOKEN } from './AuthProvider.jsx'
import { useAuth } from './useAuth.js'

function QuemEsta() {
  const { usuario } = useAuth()
  return <p>{usuario ? `logado: ${usuario.nome}` : 'deslogado'}</p>
}

describe('AuthProvider', () => {
  it('restaura a sessão de um token válido gravado', () => {
    localStorage.setItem(CHAVE_TOKEN, gerarToken({ sub: 'u1', nome: 'Equipe' }))
    render(<AuthProvider><QuemEsta /></AuthProvider>)
    expect(screen.getByText('logado: Equipe')).toBeInTheDocument()
  })

  it('token expirado na carga = deslogado, e o token é apagado', () => {
    const duasHorasAtras = Date.now() - 2 * 60 * 60 * 1000
    localStorage.setItem(CHAVE_TOKEN, gerarToken({ sub: 'u1', nome: 'Equipe' }, { agora: duasHorasAtras }))
    render(<AuthProvider><QuemEsta /></AuthProvider>)
    expect(screen.getByText('deslogado')).toBeInTheDocument()
    expect(localStorage.getItem(CHAVE_TOKEN)).toBeNull()
  })

  it('useAuth fora do provider falha com mensagem clara', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useAuth())).toThrow(/dentro de <AuthProvider>/)
  })
})
