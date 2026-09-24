import { createContext } from 'react'

// Valor: { consultas, futuras, doDia, porTipo, proximaPorPaciente, agendar(dados), cancelar(id) }.
// Provider em AppointmentsProvider.jsx; acesso por useAppointments.js.
export const AppointmentsContext = createContext(null)
