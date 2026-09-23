# Arquitetura — CardioIA Portal

> Documento da Etapa 1 (fundação). Descreve a arquitetura **planejada**; nada disto está implementado ainda.

## 1. Camadas e dependências

A regra de dependência é de cima para baixo: páginas usam componentes e contexts; contexts usam services; services não conhecem React.

```mermaid
flowchart TD
    subgraph Roteamento
        R[App.jsx<br/>BrowserRouter + Routes]
        PR[components/ProtectedRoute]
    end

    subgraph pages
        PL[Login]
        PD[Dashboard]
        PP[Pacientes]
        PA[Agendamento]
    end

    subgraph components
        L[Layout<br/>cabeçalho, navegação, rodapé com aviso]
        UI[UI: campo com rótulo, cartão de contagem,<br/>carregando / erro / vazio]
    end

    subgraph contexts
        AC[AuthContext<br/>useState + useEffect]
        APC[AppointmentsContext<br/>useReducer: agendar, cancelar]
    end

    subgraph services
        JWT[jwtFake<br/>gerar, decodificar, validar exp]
        PS[pacientesService<br/>fetch /users + adaptador]
    end

    EXT[(JSONPlaceholder<br/>/users)]
    LS[(localStorage)]

    R --> PL
    R --> PR
    PR -->|usuário logado| PD & PP & PA
    PR -.->|sem usuário| PL

    PD & PP & PA --> L
    PL & PD & PP & PA --> UI

    PL -->|useContext| AC
    PR -->|useContext| AC
    PD -->|useContext| APC
    PA -->|useContext + dispatch| APC

    PD -->|useEffect| PS
    PP -->|useEffect| PS

    AC --> JWT
    AC <--> LS
    PS --> EXT
```

| Camada | Pasta | Responsabilidade | Hooks típicos |
|---|---|---|---|
| Rotas | `src/App.jsx`, `components/ProtectedRoute` | mapear URL para página; barrar acesso sem login | `useContext`, `useLocation` |
| Páginas | `src/pages/` | compor a tela; buscar dado; tratar carregando/erro/vazio | `useState`, `useEffect`, `useContext` |
| Componentes | `src/components/` | UI reutilizável, sem conhecer rota nem API | props |
| Contexts | `src/contexts/` | estado global: sessão e consultas | `useState`, `useReducer`, `useEffect` |
| Services | `src/services/` | HTTP, adaptador, JWT fake — funções puras | nenhum |

### Por que consultas vivem num context e pacientes não

- **Consultas** são criadas no formulário (`Agendamento`) e contadas em outra tela (`Dashboard`). Estado que duas rotas precisam ler precisa estar acima das duas → `AppointmentsContext`.
- **Pacientes** vêm da API; cada página que precisa busca pelo service. Não há escrita, então não há estado a compartilhar. (Se a busca duplicada incomodar, o service pode guardar a resposta em memória — decisão da Etapa 2.)

### Adaptador usuário → paciente

`pacientesService` busca `/users` e converte cada usuário num paciente. Campos clínicos simulados (status, próxima consulta etc.) saem de uma função **determinística do `id`**: o mesmo `id` gera sempre o mesmo paciente, sem `Math.random`. Isso deixa a tela estável entre recargas e o vídeo reproduzível.

## 2. Fluxo de autenticação

### 2.1 Login

```mermaid
sequenceDiagram
    actor U as Usuário
    participant L as pages/Login
    participant A as AuthContext
    participant J as services/jwtFake
    participant S as localStorage
    participant N as react-router

    U->>L: preenche e-mail e senha
    L->>A: login(email, senha)
    A->>A: confere com credenciais de demonstração
    alt credenciais inválidas
        A-->>L: erro
        L-->>U: mensagem de erro no formulário
    else credenciais válidas
        A->>J: gerar({ sub, nome, exp })
        J-->>A: header.payload.assinatura (base64url)
        A->>S: grava token
        A->>A: setUsuario(payload)
        A-->>L: ok
        L->>N: navigate(rota de origem ou /dashboard, replace)
    end
```

### 2.2 Carga da aplicação (token já gravado)

```mermaid
sequenceDiagram
    participant App as main.jsx / AuthProvider
    participant S as localStorage
    participant J as services/jwtFake

    App->>S: lê token
    alt não há token
        App->>App: usuário = null
    else há token
        App->>J: decodificar e validar
        alt malformado ou exp no passado
            App->>S: remove token
            App->>App: usuário = null (deslogado)
        else válido
            App->>App: usuário = payload
        end
    end
    App->>App: carregando = false → rotas renderizam
```

O `AuthContext` expõe um estado de **carregando** durante essa checagem. Sem ele, o `ProtectedRoute` veria `usuário = null` no primeiro render e mandaria para `/login` quem já estava logado.

### 2.3 Rota protegida

```mermaid
flowchart LR
    A[Usuário abre /pacientes] --> B{AuthContext<br/>carregando?}
    B -->|sim| C[mostra carregando]
    B -->|não| D{usuário logado?}
    D -->|sim| E[renderiza a página]
    D -->|não| F["Navigate to=/login<br/>state={ from: /pacientes }"]
    F --> G[Login com sucesso]
    G --> H[navigate para from → /pacientes]
```

### 2.4 Logout

`logout()` remove o token do `localStorage` e zera o usuário; o `ProtectedRoute` da tela atual redireciona para `/login` no render seguinte.

## 3. Limites de segurança (aviso)

- O "JWT" é **fake**: a assinatura não é criptográfica e é gerada no próprio navegador. Serve só para simular o formato (header.payload.assinatura) e o controle de expiração.
- Token em `localStorage` é legível por qualquer script da página, portanto **vulnerável a XSS**. Aplicações reais guardam o token em **cookie `httpOnly`** emitido pelo servidor e validam a assinatura no back-end.
- A proteção de rotas aqui é só de **interface**: não há dado sensível no servidor para proteger. Tudo é simulação acadêmica.
