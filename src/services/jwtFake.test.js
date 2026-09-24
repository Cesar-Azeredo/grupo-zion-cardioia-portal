import { describe, expect, it } from 'vitest'
import { decodificarToken, gerarToken, tokenExpirado, validarToken } from './jwtFake.js'

const AGORA = Date.UTC(2026, 8, 24, 12, 0, 0)

describe('jwtFake', () => {
  it('gera token no formato header.payload.assinatura', () => {
    const token = gerarToken({ sub: 'u1' }, { agora: AGORA })
    expect(token.split('.')).toHaveLength(3)
    expect(token).not.toMatch(/[+/=]/) // base64url, sem padding
  })

  it('decodifica header e payload, com iat e exp em segundos', () => {
    const token = gerarToken({ sub: 'u1', nome: 'Equipe Ação' }, { duracaoSegundos: 60, agora: AGORA })
    const { header, payload } = decodificarToken(token)
    expect(header).toEqual({ alg: 'FAKE', typ: 'JWT' })
    expect(payload).toMatchObject({ sub: 'u1', nome: 'Equipe Ação', iat: AGORA / 1000, exp: AGORA / 1000 + 60 })
  })

  it('aceita token dentro do prazo', () => {
    const token = gerarToken({ sub: 'u1' }, { duracaoSegundos: 60, agora: AGORA })
    expect(validarToken(token, AGORA + 59_000)).toMatchObject({ sub: 'u1' })
  })

  it('detecta token expirado', () => {
    const token = gerarToken({ sub: 'u1' }, { duracaoSegundos: 60, agora: AGORA })
    const { payload } = decodificarToken(token)
    expect(tokenExpirado(payload, AGORA + 60_000)).toBe(true)
    expect(validarToken(token, AGORA + 60_000)).toBeNull()
  })

  it.each([
    ['vazio', ''],
    ['sem partes', 'abc'],
    ['com duas partes', 'abc.def'],
    ['com parte vazia', 'abc..def'],
    ['com lixo em base64', '###.###.###'],
  ])('rejeita token malformado (%s)', (_nome, token) => {
    expect(() => decodificarToken(token)).toThrow()
    expect(validarToken(token, AGORA)).toBeNull()
  })

  it('rejeita token com payload adulterado', () => {
    const [header, , assinatura] = gerarToken({ sub: 'u1' }, { agora: AGORA }).split('.')
    const payloadForjado = btoa(JSON.stringify({ sub: 'admin', exp: 9_999_999_999 })).replace(/=+$/, '')
    expect(() => decodificarToken(`${header}.${payloadForjado}.${assinatura}`)).toThrow(/Assinatura/)
  })
})
