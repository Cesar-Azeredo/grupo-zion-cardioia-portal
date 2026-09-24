# components/

Componentes reutilizáveis de interface.

- `ProtectedRoute` — redireciona para `/login` quando não há usuário e guarda a rota de origem para voltar depois do login.
- `Layout` — cabeçalho com logout, navegação e `<Outlet />` das páginas protegidas.
- `Rodape` — aviso de simulação acadêmica, presente em todas as páginas.
- `Campo` — rótulo, dica e erro ligados ao controle por `aria-describedby`.
- `EstadoTela` — `Carregando`, `ErroCarregamento` (com "Tentar de novo") e `Vazio`.
- `CartaoIndicador` — número em destaque do painel.
- `ui.module.css` — botões, cartões e alertas compartilhados.

Cada componente tem seu `NomeDoComponente.module.css` ao lado (CSS Modules).
