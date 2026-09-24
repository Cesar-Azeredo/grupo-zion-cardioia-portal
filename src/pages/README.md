# pages/

Um arquivo por rota. Páginas compõem `components/` e consomem `contexts/` e `hooks/`.

- `Login` — pública; credenciais de demonstração visíveis; erro em região `aria-live`; devolve à página de origem.
- `Dashboard` — protegida; total de pacientes, consultas futuras, de hoje e distribuição por tipo.
- `Pacientes` — protegida; lista com busca por nome e estados de carregando, erro e vazio.
- `Agendamento` — protegida; formulário com `useState` que chama `agendar()` do `AppointmentsContext`; lista de consultas futuras com cancelar.
