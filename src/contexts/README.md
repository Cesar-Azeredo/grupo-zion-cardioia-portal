# contexts/

Estado global compartilhado via Context API. Cada contexto tem três arquivos: o objeto (`XContext.js`), o provider (`XProvider.jsx`) e o hook de acesso (`useX.js`), que falha com mensagem clara fora do provider.

- `AuthContext` / `AuthProvider` / `useAuth` — usuário logado, JWT fake no `localStorage` validado na carga, `login` / `logout`, logout automático no `exp`.
- `AppointmentsContext` / `AppointmentsProvider` / `useAppointments` — consultas com `useReducer`, persistidas no `localStorage` (chave `cardioia.consultas.v1`). Expõe seletores prontos para o painel.
- `PatientsContext` / `PatientsProvider` / `usePacientes` — lista de pacientes buscada **uma vez por sessão** (JSONPlaceholder via `services/`), com `AbortController` no provider e `recarregar()`. Montado em volta das rotas protegidas, não em `main.jsx`: só busca depois do login.
- `appointmentsReducer.js` — reducer puro com as regras de agendamento, seletores e sanitização do que vem do storage.

Contexts não fazem `fetch` direto: chamam funções de `services/`.
