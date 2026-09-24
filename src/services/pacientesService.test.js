import { afterEach, describe, expect, it, vi } from 'vitest'
import { adaptarPaciente, buscarPacientes, filtrarPorNome } from './pacientesService.js'

// Formato real de um item de https://jsonplaceholder.typicode.com/users
const USUARIO = {
  id: 1,
  name: 'Leanne Graham',
  username: 'Bret',
  email: 'Sincere@april.biz',
  address: { street: 'Kulas Light', suite: 'Apt. 556', city: 'Gwenborough', zipcode: '92998-3874' },
  phone: '1-770-736-8031 x56442',
  website: 'hildegard.org',
  company: { name: 'Romaguera-Crona' },
}

describe('adaptarPaciente', () => {
  it('descarta email, phone e address (minimização)', () => {
    const paciente = adaptarPaciente(USUARIO)
    expect(paciente).not.toHaveProperty('email')
    expect(paciente).not.toHaveProperty('phone')
    expect(paciente).not.toHaveProperty('address')
    expect(JSON.stringify(paciente)).not.toMatch(/Sincere|770-736|Kulas|Gwenborough/)
  })

  it('mantém só id e nome da origem, mais o código (id formatado)', () => {
    expect(Object.keys(adaptarPaciente(USUARIO)).sort()).toEqual(['codigo', 'id', 'nome'])
    expect(adaptarPaciente(USUARIO)).toEqual({ id: 1, nome: 'Leanne Graham', codigo: 'PAC-0001' })
  })

  it('não inventa campo: sem idade, sexo, diagnóstico, risco nem rótulo clínico', () => {
    const chaves = Object.keys(adaptarPaciente(USUARIO)).join(' ')
    expect(chaves).not.toMatch(/idade|sexo|genero|diagn|risco|status|condic|doenc/i)
  })

  it('preserva o nome da API sem limpeza (títulos e sufixos ficam)', () => {
    expect(adaptarPaciente({ id: 6, name: 'Mrs. Dennis Schulist' }).nome).toBe('Mrs. Dennis Schulist')
    expect(adaptarPaciente({ id: 8, name: 'Nicholas Runolfsdottir V' }).nome).toBe('Nicholas Runolfsdottir V')
  })
})

describe('buscarPacientes', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('adapta a resposta da API', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => [USUARIO] })))
    const lista = await buscarPacientes()
    expect(lista).toHaveLength(1)
    expect(lista[0]).not.toHaveProperty('email')
  })

  it('lança erro legível quando a API responde com falha', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 503 })))
    await expect(buscarPacientes()).rejects.toThrow(/HTTP 503/)
  })
})

describe('filtrarPorNome', () => {
  const lista = [{ nome: 'José Silva' }, { nome: 'Ana Souza' }]
  it('ignora maiúsculas e acentos', () => {
    expect(filtrarPorNome(lista, 'jose')).toEqual([{ nome: 'José Silva' }])
    expect(filtrarPorNome(lista, '  ')).toEqual(lista)
  })
})
