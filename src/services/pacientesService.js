// Pacientes vêm do JSONPlaceholder (/users), convertidos por um adaptador.
//
// Minimização (LGPD, art. 6º, III — princípio da necessidade): do usuário só
// se aproveitam `id` e `name`. email, phone, address, username, website e
// company são descartados. Os dados do JSONPlaceholder já são fictícios; a
// regra demonstra o hábito, não mitiga risco real.
//
// Nenhum campo é inventado: o paciente tem só o que vem da API (id e nome,
// este SEM limpeza — "Mrs." e "V" ficam, porque limpar nome da API seria
// manipular o dado) e o código, que é o id formatado. Idade e sexo simulados
// foram removidos pelo mesmo princípio: nenhuma funcionalidade os usa. Nenhum
// diagnóstico, nível de risco ou rótulo clínico é gerado.

export const URL_PACIENTES = 'https://jsonplaceholder.typicode.com/users'

export function adaptarPaciente(usuario) {
  const id = Number(usuario.id)
  return {
    id,
    nome: String(usuario.name),
    codigo: `PAC-${String(id).padStart(4, '0')}`,
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
