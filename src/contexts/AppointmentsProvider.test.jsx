import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { dataLocalISO } from '../services/datas.js'
import { AppointmentsProvider, CHAVE_CONSULTAS } from './AppointmentsProvider.jsx'
import { useAppointments } from './useAppointments.js'

const amanha = dataLocalISO(Date.now() + 24 * 60 * 60 * 1000)
const dados = { pacienteId: 3, pacienteNome: 'Clementine Bauch', data: amanha, hora: '09:00', tipo: 'ecocardiograma' }

const usar = () => renderHook(() => useAppointments(), { wrapper: AppointmentsProvider })

describe('AppointmentsProvider', () => {
  it('agendar devolve os erros do reducer e não grava consulta inválida', () => {
    const { result } = usar()
    let resposta
    act(() => {
      resposta = result.current.agendar({ ...dados, tipo: '' })
    })
    expect(resposta).toMatchObject({ ok: false, erros: { tipo: expect.any(String) } })
    expect(result.current.futuras).toHaveLength(0)
  })

  it('persiste no localStorage com chave versionada e restaura na carga', () => {
    const { result, unmount } = usar()
    act(() => {
      result.current.agendar(dados)
    })
    expect(JSON.parse(localStorage.getItem(CHAVE_CONSULTAS))).toMatchObject({ versao: 1, consultas: [dados] })
    unmount()
    expect(usar().result.current.futuras).toMatchObject([dados])
  })

  it('JSON corrompido no localStorage não derruba o provider', () => {
    localStorage.setItem(CHAVE_CONSULTAS, '{corrompido')
    expect(usar().result.current.consultas).toEqual([])
  })
})
