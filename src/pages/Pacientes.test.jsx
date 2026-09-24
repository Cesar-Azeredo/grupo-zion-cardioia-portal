import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppointmentsContext } from '../contexts/AppointmentsContext.js'
import { PatientsProvider } from '../contexts/PatientsProvider.jsx'
import { Pacientes } from './Pacientes.jsx'

const consulta = { id: 'c1', pacienteId: 1, data: '2026-10-01', hora: '09:00', tipo: 'eletrocardiograma' }

describe('Pacientes', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('mostra a próxima consulta derivada das consultas, ou "sem consulta agendada"', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => [{ id: 1, name: 'Ana' }, { id: 2, name: 'Bia' }] })))
    render(
      <AppointmentsContext.Provider value={{ proximaPorPaciente: new Map([[1, consulta]]) }}>
        <MemoryRouter>
          <PatientsProvider>
            <Pacientes />
          </PatientsProvider>
        </MemoryRouter>
      </AppointmentsContext.Provider>,
    )
    const ana = (await screen.findByRole('heading', { name: 'Ana' })).closest('li')
    expect(ana).toHaveTextContent('09:00')
    expect(ana).toHaveTextContent('Eletrocardiograma')
    const bia = screen.getByRole('heading', { name: 'Bia' }).closest('li')
    expect(bia).toHaveTextContent('Sem consulta agendada')
    expect(bia).not.toHaveTextContent(/sexo/i)
    expect(within(bia).getByRole('link', { name: 'Agendar consulta para Bia' })).toHaveAttribute(
      'href',
      '/agendamento?paciente=2',
    )
  })
})
