# components/

Componentes reutilizáveis de interface, sem conhecimento de rota.

- `ProtectedRoute` — redireciona para `/login` quando não há usuário e guarda a rota de origem para voltar depois do login.
- Layout (cabeçalho, navegação, rodapé com aviso de simulação acadêmica).
- Peças de UI: campo de formulário com rótulo, cartão de contagem, estados de carregando / erro / vazio.

Cada componente tem seu `NomeDoComponente.module.css` ao lado (CSS Modules).
