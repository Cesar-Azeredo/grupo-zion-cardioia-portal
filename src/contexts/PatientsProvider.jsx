import { useCallback, useEffect, useMemo, useState } from 'react'
import { buscarPacientes } from '../services/pacientesService.js'
import { PatientsContext } from './PatientsContext.js'

/**
 * Busca a lista de pacientes UMA vez por sessão e a compartilha entre as
 * páginas. Fica montado em volta das rotas protegidas (App.jsx): navegar
 * entre Painel, Pacientes e Agendar não refaz a busca; sair (logout) desmonta
 * o provider e o próximo login busca de novo.
 *
 * O AbortController fica aqui: a requisição é cancelada se o provider for
 * desmontado (logout no meio da carga) ou se `recarregar` pedir outra busca,
 * e a resposta abortada não mexe em estado.
 */
export function PatientsProvider({ children }) {
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
        if (controlador.signal.aborted) return
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

  const valor = useMemo(() => ({ pacientes, status, erro, recarregar }), [pacientes, status, erro, recarregar])

  return <PatientsContext.Provider value={valor}>{children}</PatientsContext.Provider>
}
