import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App.jsx'
import { AppointmentsProvider } from './contexts/AppointmentsProvider.jsx'
import { AuthProvider, CHAVE_TOKEN } from './contexts/AuthProvider.jsx'
import { usePacientes } from './contexts/usePacientes.js'
import { gerarToken } from './services/jwtFake.js'

const USUARIOS = [
  { id: 1, name: 'Leanne Graham', email: 'x@y.test' },
  { id: 2, name: 'Ervin Howell', email: 'z@y.test' },
]

function renderizarApp(rota) {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <AuthProvider>
        <AppointmentsProvider>
          <App />
        </AppointmentsProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('App — PatientsProvider', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('navegar entre Painel, Pacientes e Agendar não dispara nova busca', async () => {
    const fetch = vi.fn(async () => ({ ok: true, json: async () => USUARIOS }))
    vi.stubGlobal('fetch', fetch)
    localStorage.setItem(CHAVE_TOKEN, gerarToken({ sub: 'u1', nome: 'Equipe' }))
    const usuario = userEvent.setup()

    renderizarApp('/dashboard')
    await act(async () => {})
    expect(screen.getByRole('heading', { level: 1, name: 'Painel' })).toBeInTheDocument()

    await usuario.click(screen.getByRole('link', { name: 'Pacientes' }))
    expect(await screen.findByRole('heading', { name: 'Leanne Graham' })).toBeInTheDocument()

    await usuario.click(screen.getByRole('link', { name: 'Agendar' }))
    expect(await screen.findByRole('option', { name: /Ervin Howell/ })).toBeInTheDocument()

    await usuario.click(screen.getByRole('link', { name: 'Painel' }))
    await usuario.click(screen.getByRole('link', { name: 'Pacientes' }))

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('não busca pacientes antes do login', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    renderizarApp('/pacientes')
    await act(async () => {})
    expect(screen.getByRole('heading', { name: 'Entrar no portal' })).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('usePacientes fora do provider falha com mensagem clara', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    function Solto() {
      usePacientes()
      return null
    }
    expect(() => render(<Solto />)).toThrow(/dentro de <PatientsProvider>/)
  })
})
