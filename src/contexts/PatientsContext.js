import { createContext } from 'react'

// Valor: { pacientes, status: 'carregando'|'sucesso'|'erro', erro, recarregar() }.
// Provider em PatientsProvider.jsx; acesso por usePacientes.js.
export const PatientsContext = createContext(null)
