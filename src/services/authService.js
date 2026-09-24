// "Back-end" de autenticação simulado. As credenciais de demonstração são
// públicas de propósito (estão no README e na tela de login).
import { gerarToken } from './jwtFake.js'

export const CREDENCIAIS_DEMO = {
  email: 'demo@cardioia.test',
  senha: 'cardio123',
}

const USUARIO_DEMO = { sub: 'usr-demo', nome: 'Equipe de Demonstração', perfil: 'recepcao' }

export const DURACAO_SESSAO_SEGUNDOS = 60 * 60 // 1 hora

/** Devolve um token se as credenciais conferem; senão, null. */
export function autenticar(email, senha, agora = Date.now()) {
  const emailNormalizado = String(email).trim().toLowerCase()
  if (emailNormalizado !== CREDENCIAIS_DEMO.email || senha !== CREDENCIAIS_DEMO.senha) {
    return null
  }
  return gerarToken(USUARIO_DEMO, { duracaoSegundos: DURACAO_SESSAO_SEGUNDOS, agora })
}
