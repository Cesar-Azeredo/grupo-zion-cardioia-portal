import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthContext } from '../contexts/AuthContext.js'
import { ProtectedRoute } from './ProtectedRoute.jsx'

function PaginaLogin() {
  const location = useLocation()
  return <p>Página de login (origem: {location.state?.from?.pathname})</p>
}

function renderizar(usuario) {
  return render(
    <AuthContext.Provider value={{ usuario, login: () => false, logout: () => {} }}>
      <MemoryRouter initialEntries={['/pacientes']}>
        <Routes>
          <Route path="/login" element={<PaginaLogin />} />
          <Route
            path="/pacientes"
            element={
              <ProtectedRoute>
                <p>Lista de pacientes</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('ProtectedRoute', () => {
  it('sem usuário, redireciona para /login guardando a rota de origem', () => {
    renderizar(null)
    expect(screen.getByText('Página de login (origem: /pacientes)')).toBeInTheDocument()
    expect(screen.queryByText('Lista de pacientes')).not.toBeInTheDocument()
  })

  it('com usuário, renderiza o conteúdo protegido', () => {
    renderizar({ sub: 'u1', nome: 'Teste', exp: 9_999_999_999 })
    expect(screen.getByText('Lista de pacientes')).toBeInTheDocument()
  })
})
