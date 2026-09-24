// Acesso ao localStorage com try/catch: modo privado, cota cheia ou JSON
// corrompido não podem derrubar a aplicação.

export function lerJSON(chave, padrao) {
  try {
    const bruto = localStorage.getItem(chave)
    return bruto === null ? padrao : JSON.parse(bruto)
  } catch {
    return padrao
  }
}

export function gravarJSON(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor))
    return true
  } catch {
    return false
  }
}

export function lerTexto(chave) {
  try {
    return localStorage.getItem(chave)
  } catch {
    return null
  }
}

export function gravarTexto(chave, valor) {
  try {
    localStorage.setItem(chave, valor)
    return true
  } catch {
    return false
  }
}

export function remover(chave) {
  try {
    localStorage.removeItem(chave)
  } catch {
    // sem acesso ao storage: nada a remover
  }
}
