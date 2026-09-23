# contexts/

Estado global compartilhado via Context API.

- `AuthContext` — usuário logado, JWT fake no `localStorage`, `login`/`logout`, validação do `exp` na carga.
- `AppointmentsContext` — consultas agendadas, com `useReducer` (ações `agendar` e `cancelar`). O dashboard lê daqui para contar consultas.

Contexts não fazem `fetch` direto: chamam funções de `services/`.
