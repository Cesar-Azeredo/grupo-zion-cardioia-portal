import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { gravarJSON, lerJSON } from '../services/storage.js'
import { AppointmentsContext } from './AppointmentsContext.js'
import {
  appointmentsReducer,
  distribuicaoPorTipo,
  estadoInicial,
  sanitizarConsultasSalvas,
  selecionarDoDia,
  selecionarFuturas,
} from './appointmentsReducer.js'

// Chave versionada: se o formato mudar, troca-se para .v2 e o dado antigo é
// ignorado em vez de quebrar a tela.
export const CHAVE_CONSULTAS = 'cardioia.consultas.v1'
const VERSAO = 1

function carregarEstado() {
  const salvo = lerJSON(CHAVE_CONSULTAS, null)
  if (salvo?.versao !== VERSAO) return estadoInicial
  return { ...estadoInicial, consultas: sanitizarConsultasSalvas(salvo) }
}

function novoId() {
  return globalThis.crypto?.randomUUID?.() ?? `c-${Date.now()}-${Math.floor(Math.random() * 1e6)}`
}

export function AppointmentsProvider({ children }) {
  const [estado, dispatch] = useReducer(appointmentsReducer, undefined, carregarEstado)

  // "Agora" atualizado a cada minuto: consultas que passam de horário saem
  // da contagem de futuras sem precisar recarregar a página.
  const [agora, setAgora] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

  // Persistência: grava a cada mudança da lista (gravarJSON já tem try/catch).
  useEffect(() => {
    gravarJSON(CHAVE_CONSULTAS, { versao: VERSAO, consultas: estado.consultas })
  }, [estado.consultas])

  // Ref com o estado mais recente, para agendar() não ficar com estado velho.
  const estadoRef = useRef(estado)
  useEffect(() => {
    estadoRef.current = estado
  }, [estado])

  /**
   * Monta a ação, pergunta ao próprio reducer se ela é aceita (função pura,
   * sem efeito colateral) e só então despacha. Assim o formulário recebe os
   * erros na hora e as regras moram num lugar só: o reducer.
   */
  const agendar = useCallback((dados) => {
    const acao = {
      type: 'consulta/agendar',
      agora: Date.now(),
      consulta: { ...dados, id: novoId(), observacoes: (dados.observacoes ?? '').trim() },
    }
    const resultado = appointmentsReducer(estadoRef.current, acao)
    if (resultado.rejeicao) return { ok: false, erros: resultado.rejeicao.erros }
    estadoRef.current = resultado
    dispatch(acao)
    return { ok: true, consulta: acao.consulta }
  }, [])

  const cancelar = useCallback((id) => dispatch({ type: 'consulta/cancelar', id }), [])

  const valor = useMemo(() => {
    const futuras = selecionarFuturas(estado.consultas, agora)
    return {
      consultas: estado.consultas,
      futuras,
      doDia: selecionarDoDia(estado.consultas, agora),
      porTipo: distribuicaoPorTipo(futuras),
      agendar,
      cancelar,
    }
  }, [estado.consultas, agora, agendar, cancelar])

  return <AppointmentsContext.Provider value={valor}>{children}</AppointmentsContext.Provider>
}
