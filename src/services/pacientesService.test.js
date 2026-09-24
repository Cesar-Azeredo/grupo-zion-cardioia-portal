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

  it('mantém só id e nome da origem, mais campos simulados', () => {
    expect(Object.keys(adaptarPaciente(USUARIO)).sort()).toEqual(['codigo', 'id', 'idade', 'nome', 'sexo'])
    expect(adaptarPaciente(USUARIO)).toMatchObject({ id: 1, nome: 'Leanne Graham', codigo: 'PAC-0001' })
  })

  it('campos simulados são determinísticos a partir do id', () => {
    expect(adaptarPaciente(USUARIO)).toEqual(adaptarPaciente({ ...USUARIO }))
    const idades = Array.from({ length: 10 }, (_, i) => adaptarPaciente({ id: i + 1, name: 'x' }).idade)
    idades.forEach((idade) => expect(idade).toBeGreaterThanOrEqual(30))
    idades.forEach((idade) => expect(idade).toBeLessThanOrEqual(84))
  })

  it('não gera diagnóstico, risco nem rótulo clínico', () => {
    const chaves = Object.keys(adaptarPaciente(USUARIO)).join(' ')
    expect(chaves).not.toMatch(/diagn|risco|status|condic|doenc/i)
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
