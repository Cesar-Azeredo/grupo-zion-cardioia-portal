import { useContext } from 'react'
import { AppointmentsContext } from './AppointmentsContext.js'

export function useAppointments() {
  const valor = useContext(AppointmentsContext)
  if (valor === null) {
    throw new Error(
      'useAppointments() precisa estar dentro de <AppointmentsProvider>. Envolva a aplicação com o provider em main.jsx.',
    )
  }
  return valor
}
