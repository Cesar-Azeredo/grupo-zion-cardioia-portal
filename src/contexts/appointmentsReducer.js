// Regras de negócio das consultas. Tudo aqui é função pura: o "agora" chega
// na ação e o id da consulta também, para o reducer ser determinístico e
// testável. O formulário não valida por conta própria: ele pergunta ao
// reducer (ver AppointmentsProvider.agendar).
import { dataLocalISO, instanteDe } from '../services/datas.js'

export const TIPOS_CONSULTA = [
  { valor: 'consulta-cardiologica', rotulo: 'Consulta cardiológica' },
  { valor: 'eletrocardiograma', rotulo: 'Eletrocardiograma' },
  { valor: 'ecocardiograma', rotulo: 'Ecocardiograma' },
]

export const LIMITE_OBSERVACOES = 500

export const estadoInicial = { consultas: [], rejeicao: null }

export function rotuloDoTipo(valor) {
  return TIPOS_CONSULTA.find((t) => t.valor === valor)?.rotulo ?? valor
}

/**
 * Valida uma consulta contra as regras e as consultas existentes.
 * @returns {Record<string, string>} erros por campo; objeto vazio = válida
 */
export function validarConsulta(consulta, consultasExistentes, agora) {
  const erros = {}
  const { pacienteId, data, hora, tipo, observacoes = '' } = consulta

  if (!pacienteId) erros.pacienteId = 'Selecione o paciente.'
  if (!data) erros.data = 'Informe a data.'
  if (!hora) erros.hora = 'Informe o horário.'
  if (!tipo) erros.tipo = 'Selecione o tipo de consulta.'
  else if (!TIPOS_CONSULTA.some((t) => t.valor === tipo)) erros.tipo = 'Tipo de consulta inválido.'
  if (observacoes.length > LIMITE_OBSERVACOES) {
    erros.observacoes = `Use no máximo ${LIMITE_OBSERVACOES} caracteres.`
  }

  if (data && hora) {
    const instante = instanteDe(data, hora)
    if (Number.isNaN(instante)) {
      erros.data = 'Data ou horário inválido.'
    } else if (instante <= agora) {
      // Mesmo dia com hora já passada: o erro é da hora; dia passado: da data.
      if (data === dataLocalISO(agora)) erros.hora = 'Este horário de hoje já passou.'
      else erros.data = 'A data não pode estar no passado.'
    } else if (
      pacienteId &&
      consultasExistentes.some((c) => c.pacienteId === pacienteId && c.data === data && c.hora === hora)
    ) {
      erros.hora = 'Este paciente já tem uma consulta neste dia e horário.'
    }
  }

  return erros
}

export function appointmentsReducer(estado, acao) {
  switch (acao.type) {
    case 'consulta/agendar': {
      const erros = validarConsulta(acao.consulta, estado.consultas, acao.agora)
      if (Object.keys(erros).length > 0) {
        return { ...estado, rejeicao: { erros } }
      }
      return { consultas: [...estado.consultas, acao.consulta], rejeicao: null }
    }
    case 'consulta/cancelar':
      return { consultas: estado.consultas.filter((c) => c.id !== acao.id), rejeicao: null }
    default:
      throw new Error(`Ação desconhecida no appointmentsReducer: ${acao.type}`)
  }
}

// ---- Seletores: o dashboard lê estes números, não recalcula por conta própria.

const porInstante = (a, b) => instanteDe(a.data, a.hora) - instanteDe(b.data, b.hora)

export function selecionarFuturas(consultas, agora) {
  return consultas.filter((c) => instanteDe(c.data, c.hora) > agora).sort(porInstante)
}

export function selecionarDoDia(consultas, agora) {
  const hoje = dataLocalISO(agora)
  return consultas.filter((c) => c.data === hoje).sort(porInstante)
}

/** Map pacienteId → próxima consulta (a lista de futuras já vem ordenada). */
export function proximaPorPaciente(futuras) {
  const mapa = new Map()
  futuras.forEach((c) => {
    if (!mapa.has(c.pacienteId)) mapa.set(c.pacienteId, c)
  })
  return mapa
}

export function distribuicaoPorTipo(consultas) {
  return TIPOS_CONSULTA.map(({ valor, rotulo }) => ({
    tipo: valor,
    rotulo,
    total: consultas.filter((c) => c.tipo === valor).length,
  }))
}

// ---- Persistência: o que vem do localStorage é conferido antes de entrar.

const CAMPOS_TEXTO = ['id', 'pacienteNome', 'data', 'hora', 'tipo']

export function sanitizarConsultasSalvas(bruto) {
  const lista = bruto?.consultas
  if (!Array.isArray(lista)) return []
  return lista.filter(
    (c) =>
      c &&
      typeof c === 'object' &&
      Number.isInteger(c.pacienteId) &&
      CAMPOS_TEXTO.every((campo) => typeof c[campo] === 'string') &&
      !Number.isNaN(instanteDe(c.data, c.hora)),
  )
}
