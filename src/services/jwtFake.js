// JWT FAKE — só simula o formato header.payload.assinatura e o controle de
// expiração. A "assinatura" é um hash não criptográfico calculado no próprio
// navegador: qualquer pessoa consegue forjá-la. Em produção, o token é
// assinado e validado no servidor e trafega em cookie httpOnly.

const SEGREDO_DEMO = 'cardioia-portal-demo'

function base64urlCodificar(texto) {
  const bytes = new TextEncoder().encode(texto)
  let binario = ''
  bytes.forEach((b) => {
    binario += String.fromCharCode(b)
  })
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64urlDecodificar(trecho) {
  const base64 = trecho.replace(/-/g, '+').replace(/_/g, '/')
  const completo = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const binario = atob(completo)
  const bytes = Uint8Array.from(binario, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

// Hash djb2 em hexadecimal: determinístico e suficiente para detectar
// adulteração acidental do payload. NÃO é segurança.
function assinar(conteudo) {
  let hash = 5381
  const texto = `${conteudo}.${SEGREDO_DEMO}`
  for (let i = 0; i < texto.length; i += 1) {
    hash = ((hash << 5) + hash + texto.charCodeAt(i)) >>> 0
  }
  return base64urlCodificar(hash.toString(16))
}

/**
 * Gera um token com `iat` e `exp` (em segundos, como no JWT real).
 * @param {object} dados campos do payload (ex.: sub, nome)
 * @param {{ duracaoSegundos?: number, agora?: number }} opcoes agora em ms
 */
export function gerarToken(dados, { duracaoSegundos = 60 * 60, agora = Date.now() } = {}) {
  const iat = Math.floor(agora / 1000)
  const header = base64urlCodificar(JSON.stringify({ alg: 'FAKE', typ: 'JWT' }))
  const payload = base64urlCodificar(JSON.stringify({ ...dados, iat, exp: iat + duracaoSegundos }))
  return `${header}.${payload}.${assinar(`${header}.${payload}`)}`
}

/**
 * Decodifica e confere formato e assinatura. Lança erro se o token for
 * malformado ou adulterado. NÃO confere expiração (ver tokenExpirado).
 */
export function decodificarToken(token) {
  if (typeof token !== 'string') throw new Error('Token ausente.')
  const partes = token.split('.')
  if (partes.length !== 3 || partes.some((p) => p === '')) {
    throw new Error('Token malformado: esperado header.payload.assinatura.')
  }
  const [header, payload, assinatura] = partes
  if (assinar(`${header}.${payload}`) !== assinatura) {
    throw new Error('Assinatura do token não confere.')
  }
  let dados
  try {
    dados = { header: JSON.parse(base64urlDecodificar(header)), payload: JSON.parse(base64urlDecodificar(payload)) }
  } catch {
    throw new Error('Token malformado: conteúdo não é JSON em base64url.')
  }
  if (typeof dados.payload.exp !== 'number') throw new Error('Token sem exp.')
  return dados
}

export function tokenExpirado(payload, agora = Date.now()) {
  return payload.exp * 1000 <= agora
}

/** Devolve o payload se o token for válido e não expirado; senão, null. */
export function validarToken(token, agora = Date.now()) {
  try {
    const { payload } = decodificarToken(token)
    return tokenExpirado(payload, agora) ? null : payload
  } catch {
    return null
  }
}
