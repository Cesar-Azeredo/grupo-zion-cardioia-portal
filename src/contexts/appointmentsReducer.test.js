import { describe, expect, it } from 'vitest'
import {
  appointmentsReducer,
  distribuicaoPorTipo,
  estadoInicial,
  sanitizarConsultasSalvas,
  selecionarDoDia,
  selecionarFuturas,
} from './appointmentsReducer.js'

// 24/09/2026 10:00 no fuso local (os testes não dependem do fuso da máquina).
const AGORA = new Date(2026, 8, 24, 10, 0).getTime()

const consulta = (sobrescrever = {}) => ({
  id: 'c1',
  pacienteId: 1,
  pacienteNome: 'Leanne Graham',
  data: '2026-09-25',
  hora: '14:30',
  tipo: 'eletrocardiograma',
  observacoes: '',
  ...sobrescrever,
})

const agendar = (estado, c) => appointmentsReducer(estado, { type: 'consulta/agendar', consulta: c, agora: AGORA })

describe('appointmentsReducer', () => {
  it('agenda uma consulta válida', () => {
    const estado = agendar(estadoInicial, consulta())
    expect(estado.consultas).toEqual([consulta()])
    expect(estado.rejeicao).toBeNull()
  })

  it('cancela pelo id', () => {
    const comDuas = agendar(agendar(estadoInicial, consulta()), consulta({ id: 'c2', hora: '15:00' }))
    const estado = appointmentsReducer(comDuas, { type: 'consulta/cancelar', id: 'c1' })
    expect(estado.consultas.map((c) => c.id)).toEqual(['c2'])
  })

  it('rejeita campos obrigatórios vazios, sem alterar a lista', () => {
    const estado = agendar(estadoInicial, consulta({ pacienteId: null, data: '', hora: '', tipo: '' }))
    expect(estado.consultas).toEqual([])
    expect(Object.keys(estado.rejeicao.erros).sort()).toEqual(['data', 'hora', 'pacienteId', 'tipo'])
  })

  it('rejeita data no passado', () => {
    const estado = agendar(estadoInicial, consulta({ data: '2026-09-23' }))
    expect(estado.consultas).toEqual([])
    expect(estado.rejeicao.erros.data).toMatch(/passado/)
  })

  it('rejeita horário de hoje que já passou, apontando o erro na hora', () => {
    const estado = agendar(estadoInicial, consulta({ data: '2026-09-24', hora: '09:59' }))
    expect(estado.consultas).toEqual([])
    expect(estado.rejeicao.erros.hora).toMatch(/já passou/)
  })

  it('aceita horário de hoje ainda no futuro', () => {
    expect(agendar(estadoInicial, consulta({ data: '2026-09-24', hora: '10:01' })).consultas).toHaveLength(1)
  })

  it('rejeita o mesmo paciente duas vezes no mesmo horário', () => {
    const primeiro = agendar(estadoInicial, consulta())
    const estado = agendar(primeiro, consulta({ id: 'c2', tipo: 'ecocardiograma' }))
    expect(estado.consultas).toHaveLength(1)
    expect(estado.rejeicao.erros.hora).toMatch(/já tem uma consulta/)
  })

  it('aceita outro paciente no mesmo horário', () => {
    const primeiro = agendar(estadoInicial, consulta())
    expect(agendar(primeiro, consulta({ id: 'c2', pacienteId: 2 })).consultas).toHaveLength(2)
  })

  it('rejeita tipo fora da lista e data inexistente', () => {
    expect(agendar(estadoInicial, consulta({ tipo: 'cirurgia' })).rejeicao.erros.tipo).toBeDefined()
    expect(agendar(estadoInicial, consulta({ data: '2026-02-31' })).rejeicao.erros.data).toMatch(/inválid/)
  })

  it('falha alto em ação desconhecida', () => {
    expect(() => appointmentsReducer(estadoInicial, { type: 'x' })).toThrow(/desconhecida/)
  })
})

describe('seletores', () => {
  const lista = [
    consulta({ id: 'passada', data: '2026-09-24', hora: '08:00' }),
    consulta({ id: 'hoje', data: '2026-09-24', hora: '16:00', tipo: 'ecocardiograma' }),
    consulta({ id: 'amanha', data: '2026-09-25' }),
  ]

  it('futuras exclui as que já passaram e ordena por data', () => {
    expect(selecionarFuturas(lista, AGORA).map((c) => c.id)).toEqual(['hoje', 'amanha'])
  })

  it('do dia inclui todas de hoje', () => {
    expect(selecionarDoDia(lista, AGORA).map((c) => c.id)).toEqual(['passada', 'hoje'])
  })

  it('distribuição conta por tipo, incluindo zeros', () => {
    expect(distribuicaoPorTipo(selecionarFuturas(lista, AGORA)).map((t) => t.total)).toEqual([0, 1, 1])
  })
})

describe('sanitizarConsultasSalvas', () => {
  it('descarta registros corrompidos do localStorage', () => {
    const bruto = { consultas: [consulta(), { id: 1 }, null, consulta({ data: 'ontem' })] }
    expect(sanitizarConsultasSalvas(bruto)).toEqual([consulta()])
    expect(sanitizarConsultasSalvas('lixo')).toEqual([])
  })
})
