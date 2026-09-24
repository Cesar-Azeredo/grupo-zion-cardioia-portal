import { useCallback, useEffect, useState } from 'react'
import { buscarPacientes } from '../services/pacientesService.js'

/**
 * Busca a lista de pacientes ao montar a página que usa o hook.
 * O AbortController cancela a requisição quando a página sai (ou quando
 * `recarregar` dispara uma nova busca), para não atualizar estado de um
 * componente desmontado nem aplicar uma resposta velha.
 *
 * @returns {{ pacientes: object[], status: 'carregando'|'sucesso'|'erro', erro: string, recarregar: () => void }}
 */
export function usePacientes() {
  const [pacientes, setPacientes] = useState([])
  const [status, setStatus] = useState('carregando')
  const [erro, setErro] = useState('')
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    const controlador = new AbortController()

    buscarPacientes({ signal: controlador.signal })
      .then((lista) => {
        setPacientes(lista)
        setStatus('sucesso')
      })
      .catch((e) => {
        if (controlador.signal.aborted) return // página saiu: não mexe em estado
        setErro(e instanceof TypeError ? 'Não foi possível conectar ao serviço de pacientes. Verifique a internet.' : e.message)
        setStatus('erro')
      })

    return () => controlador.abort()
  }, [tentativa])

  // O "carregando" é marcado no evento que pede a nova busca, não dentro do
  // efeito (evita um render em cascata).
  const recarregar = useCallback(() => {
    setStatus('carregando')
    setErro('')
    setTentativa((n) => n + 1)
  }, [])

  return { pacientes, status, erro, recarregar }
}
