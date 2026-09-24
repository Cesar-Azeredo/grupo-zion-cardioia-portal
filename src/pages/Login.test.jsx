import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ProtectedRoute } from '../components/ProtectedRoute.jsx'
import { AuthProvider, CHAVE_TOKEN } from '../contexts/AuthProvider.jsx'
import { CREDENCIAIS_DEMO } from '../services/authService.js'
import { Login } from './Login.jsx'

function renderizarEm(rota) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[rota]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/agendamento" element={<p>Tela de agendamento</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('Login', () => {
  it('credencial errada mostra erro em região viva e não grava token', async () => {
    const usuario = userEvent.setup()
    renderizarEm('/login')
    await usuario.type(screen.getByLabelText(/E-mail/), 'alguem@exemplo.test')
    await usuario.type(screen.getByLabelText(/Senha/), 'errada')
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(screen.getByRole('alert')).toHaveTextContent(/incorretos/)
    expect(localStorage.getItem(CHAVE_TOKEN)).toBeNull()
  })

  it('depois do login, devolve à página que o usuário tentou abrir', async () => {
    const usuario = userEvent.setup()
    renderizarEm('/agendamento')
    await usuario.type(screen.getByLabelText(/E-mail/), CREDENCIAIS_DEMO.email)
    await usuario.type(screen.getByLabelText(/Senha/), CREDENCIAIS_DEMO.senha)
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(screen.getByText('Tela de agendamento')).toBeInTheDocument()
    expect(localStorage.getItem(CHAVE_TOKEN)).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/)
  })
})
