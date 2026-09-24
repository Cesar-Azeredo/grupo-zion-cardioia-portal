// Pacientes vêm do JSONPlaceholder (/users), convertidos por um adaptador.
//
// Minimização (LGPD, art. 6º, III — princípio da necessidade): do usuário só
// se aproveitam `id` e `name`. email, phone, address, username, website e
// company são descartados. Os dados do JSONPlaceholder já são fictícios; a
// regra demonstra o hábito, não mitiga risco real.
//
// A idade é SIMULADA, derivada deterministicamente do id (mesmo id, mesmo
// valor, sem Math.random). Sexo NÃO entra: nenhuma funcionalidade o usa
// (princípio da necessidade), inferi-lo pelo nome seria outro viés e um valor
// derivado do id contradiria o nome. Nenhum diagnóstico, nível de risco ou
// rótulo clínico é gerado: o portal não diagnostica.

export const URL_PACIENTES = 'https://jsonplaceholder.typicode.com/users'

export function idadeSimulada(id) {
  return 30 + ((id * 37) % 55) // 30 a 84 anos
}

export function adaptarPaciente(usuario) {
  const id = Number(usuario.id)
  return {
    id,
    nome: String(usuario.name),
    codigo: `PAC-${String(id).padStart(4, '0')}`,
    idade: idadeSimulada(id),
  }
}

/**
 * Busca e adapta a lista. Aceita um AbortSignal para cancelar a requisição
 * quando a página que pediu os dados é desmontada.
 */
export async function buscarPacientes({ signal } = {}) {
  const resposta = await fetch(URL_PACIENTES, { signal, headers: { Accept: 'application/json' } })
  if (!resposta.ok) {
    throw new Error(`O serviço de pacientes respondeu com erro (HTTP ${resposta.status}).`)
  }
  const dados = await resposta.json()
  if (!Array.isArray(dados)) {
    throw new Error('Resposta inesperada do serviço de pacientes.')
  }
  return dados.map(adaptarPaciente)
}

// Busca por nome sem diferenciar maiúsculas nem acentos ("jose" acha "José").
export function normalizarBusca(texto) {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

export function filtrarPorNome(pacientes, termo) {
  const alvo = normalizarBusca(termo)
  if (!alvo) return pacientes
  return pacientes.filter((p) => normalizarBusca(p.nome).includes(alvo))
}
