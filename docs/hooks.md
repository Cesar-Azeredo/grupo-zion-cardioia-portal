# Hooks — onde cada um é usado e por quê

Mapa do uso de hooks no portal (estado da Etapa 2). Caminhos relativos a `src/`.

## Hooks do React

| Hook | Onde | Para quê | Por que este hook (e não outro) |
|---|---|---|---|
| `useState` | `pages/Login.jsx` (e-mail, senha, erro) | campos controlados do formulário de login e a mensagem de erro | estado local e simples de uma tela; ninguém fora do Login precisa dele |
| `useState` | `pages/Agendamento.jsx` (`campos`, `erros`, `aviso`) | campos do formulário de agendamento, erros por campo e mensagem de sucesso | o enunciado pede `useState` no formulário; o estado das **consultas** fica no reducer, o do **rascunho** fica aqui |
| `useState` | `pages/Pacientes.jsx` (`busca`) | termo digitado na busca por nome | filtro é derivado na renderização (`filtrarPorNome`), então só o termo vira estado |
| `useState` | `hooks/usePacientes.js` (`pacientes`, `status`, `erro`, `tentativa`) | resultado da requisição e o estado carregando / sucesso / erro | `tentativa` é um contador: incrementá-lo dispara uma nova busca ("Tentar de novo") |
| `useState` | `contexts/AuthProvider.jsx` (`usuario`) | usuário logado | **inicialização preguiçosa** (`useState(carregarSessao)`): o token do `localStorage` é validado antes do primeiro render, então o `ProtectedRoute` nunca vê um "deslogado" falso |
| `useState` | `contexts/AppointmentsProvider.jsx` (`agora`) | instante atual, renovado a cada minuto | consultas que passam do horário saem de "futuras" sem recarregar a página |
| `useReducer` | `contexts/AppointmentsProvider.jsx` com `contexts/appointmentsReducer.js` | lista de consultas; ações `consulta/agendar` e `consulta/cancelar` | várias transições com regras (obrigatórios, sem data passada, sem horário duplicado) ficam num **reducer puro e testável**, em vez de espalhadas em `setState`; o terceiro argumento (`carregarEstado`) lê o `localStorage` só uma vez |
| `useEffect` | `hooks/usePacientes.js` | busca `/users` do JSONPlaceholder ao montar a página | sincroniza com um sistema externo (a API). Devolve `controlador.abort()` como limpeza: a requisição é **cancelada quando a página sai**, e a resposta abortada não mexe em estado |
| `useEffect` | `contexts/AppointmentsProvider.jsx` (persistência) | grava as consultas no `localStorage` a cada mudança da lista | efeito colateral após a mudança de estado; o reducer fica puro. Chave versionada `cardioia.consultas.v1`, gravação com `try/catch` |
| `useEffect` | `contexts/AppointmentsProvider.jsx` (relógio) | `setInterval` de 60 s que atualiza `agora` | assina um temporizador e o **limpa** no desmonte (`clearInterval`) |
| `useEffect` | `contexts/AuthProvider.jsx` | agenda o logout para o instante do `exp` do token | a sessão expira sozinha; a limpeza (`clearTimeout`) evita logout duplo após login/logout manual |
| `useEffect` | `hooks/useTituloPagina.js` | atualiza `document.title` a cada página | sincroniza com o DOM fora do React; leitores de tela anunciam o título na troca de rota |
| `useContext` | `contexts/useAuth.js`, `contexts/useAppointments.js` | leem o `AuthContext` e o `AppointmentsContext` | o acesso ao contexto é **encapsulado** num hook próprio; nenhum componente chama `useContext` direto |
| `useMemo` | `AuthProvider.jsx`, `AppointmentsProvider.jsx` | estabiliza o objeto `value` do provider e calcula os seletores (futuras, do dia, por tipo) | sem ele, todo render do provider criaria um objeto novo e re-renderizaria todos os consumidores |
| `useCallback` | `AuthProvider.jsx` (`login`, `logout`), `AppointmentsProvider.jsx` (`agendar`, `cancelar`), `usePacientes.js` (`recarregar`) | funções expostas por contexto/hook com identidade estável | entram em `useMemo`/dependências de efeito; identidade estável evita recalcular à toa |
| `useRef` | `AppointmentsProvider.jsx` (`estadoRef`) | guarda o estado mais recente para `agendar()` | `agendar` pergunta ao reducer se a consulta é aceita **antes** de despachar; o ref garante que ele veja o estado atual, inclusive em dois agendamentos seguidos |

## Hooks do react-router-dom

| Hook | Onde | Para quê |
|---|---|---|
| `useLocation` | `components/ProtectedRoute.jsx` | guarda a rota que o usuário tentou abrir em `state.from` ao mandar para `/login` |
| `useLocation` + `useNavigate` | `pages/Login.jsx` | depois do login, devolve o usuário para `state.from` (ou `/dashboard`) com `replace` |
| `useSearchParams` | `pages/Agendamento.jsx` | lê `?paciente=<id>` vindo do botão "Agendar consulta" da lista de pacientes e pré-seleciona o paciente |

## Hooks próprios

| Hook | Arquivo | O que encapsula | Usado em |
|---|---|---|---|
| `useAuth()` | `contexts/useAuth.js` | `useContext(AuthContext)`; **lança erro claro** se usado fora do `<AuthProvider>` | `ProtectedRoute`, `Layout`, `Login`, `Dashboard` |
| `useAppointments()` | `contexts/useAppointments.js` | `useContext(AppointmentsContext)`; lança erro claro fora do provider. Expõe `consultas`, `futuras`, `doDia`, `porTipo`, `agendar`, `cancelar` | `Agendamento`, `Dashboard` |
| `usePacientes()` | `hooks/usePacientes.js` | busca com `useEffect` + `AbortController`; devolve `{ pacientes, status, erro, recarregar }` | `Pacientes`, `Agendamento` (lista do select), `Dashboard` (total) |
| `useTituloPagina(titulo)` | `hooks/useTituloPagina.js` | `useEffect` que ajusta `document.title` | todas as páginas |

## Cuidados no uso de hooks

- **Nenhum `setState` síncrono dentro de efeito.** O "carregando" da nova tentativa é marcado no clique (`recarregar`), não dentro do `useEffect` — o `oxlint` (`react/set-state-in-effect`) confere isso.
- **Todo efeito que assina algo tem limpeza:** `abort()`, `clearInterval`, `clearTimeout`.
- **Reducer puro:** o instante atual (`agora`) e o `id` da consulta chegam **na ação**; o reducer não chama `Date.now()` nem gera aleatoriedade. Por isso ele é testado sem mock de relógio.
- **Derivar em vez de guardar:** lista filtrada, consultas futuras e distribuição por tipo são calculadas a partir do estado, não armazenadas em outro `useState`.
- **Pacientes não estão num contexto:** a lista é só leitura e cada página busca a sua, com cancelamento ao sair. As consultas estão num contexto porque são **escritas** numa rota (Agendamento) e **lidas** em outra (Dashboard).
