import { act, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppointmentsContext } from '../contexts/AppointmentsContext.js'
import { AuthContext } from '../contexts/AuthContext.js'
import { PatientsProvider } from '../contexts/PatientsProvider.jsx'
import { distribuicaoPorTipo } from '../contexts/appointmentsReducer.js'
import { Dashboard } from './Dashboard.jsx'

const futuras = [
  { id: 'a', tipo: 'ecocardiograma' },
  { id: 'b', tipo: 'ecocardiograma' },
  { id: 'c', tipo: 'eletrocardiograma' },
]

describe('Dashboard', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('mostra as contagens vindas dos contexts e da API', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => [{ id: 1, name: 'A' }, { id: 2, name: 'B' }] })))
    render(
      <AuthContext.Provider value={{ usuario: { nome: 'Equipe' } }}>
        <AppointmentsContext.Provider value={{ futuras, doDia: [futuras[0]], porTipo: distribuicaoPorTipo(futuras) }}>
          <MemoryRouter>
            <PatientsProvider>
              <Dashboard />
            </PatientsProvider>
          </MemoryRouter>
        </AppointmentsContext.Provider>
      </AuthContext.Provider>,
    )
    await act(async () => {})
    expect(within(screen.getByRole('region', { name: 'Total de pacientes' })).getByText('2')).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Consultas agendadas' })).getByText('3')).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Consultas de hoje' })).getByText('1')).toBeInTheDocument()
    const tipos = screen.getByRole('region', { name: 'Consultas agendadas por tipo' })
    expect(within(tipos).getByText('Ecocardiograma').closest('li')).toHaveTextContent('2 consultas')
  })
})
