# hooks/

Hooks próprios reaproveitados entre páginas (fora dos contexts).

- `usePacientes` — busca a lista de pacientes com `useEffect` + `AbortController` (cancela quando a página sai); devolve `{ pacientes, status, erro, recarregar }`.
- `useTituloPagina` — ajusta `document.title` a cada página.

Tabela completa de hooks em [`docs/hooks.md`](../../docs/hooks.md).
