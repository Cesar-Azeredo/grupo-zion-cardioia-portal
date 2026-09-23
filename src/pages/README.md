# pages/

Uma pasta/arquivo por rota. Páginas compõem `components/` e consomem `contexts/`.

- `Login` — pública; credenciais de demonstração documentadas no README da raiz.
- `Dashboard` — protegida; contagem de pacientes e de consultas agendadas.
- `Pacientes` — protegida; listagem vinda de `services/`, com estados de carregando, erro e vazio.
- `Agendamento` — protegida; formulário com `useState` que dispara ações no `AppointmentsContext`.
