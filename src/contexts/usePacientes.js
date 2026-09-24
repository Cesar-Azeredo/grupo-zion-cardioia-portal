import { useContext } from 'react'
import { PatientsContext } from './PatientsContext.js'

export function usePacientes() {
  const valor = useContext(PatientsContext)
  if (valor === null) {
    throw new Error(
      'usePacientes() precisa estar dentro de <PatientsProvider>. Ele envolve as rotas protegidas em App.jsx.',
    )
  }
  return valor
}
