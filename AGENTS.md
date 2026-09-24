# AGENTS.md — Contexto operacional do CardioIA Portal (Ir Além 1)

> **Este arquivo é a fonte única do contexto do projeto.** É lido diretamente pelo GitHub Copilot, Cursor, Codex e afins.
> O `CLAUDE.md` da raiz contém apenas `@AGENTS.md`, que importa este arquivo para o Claude Code. Edite só este arquivo.

---

## 1. Contexto

**CardioIA** é um projeto acadêmico de IA em cardiologia, em 7 fases, do curso de Inteligência Artificial da **FIAP**.
Este repositório é o **Ir Além 1**, uma entrega extra da **Fase 2**: só a **interface** de um portal que simula a rotina de um centro de diagnóstico cardiológico. **Dados simulados, nenhum back-end real.**

É um repositório **separado** do repositório principal do projeto (`github.com/Cesar-Azeredo/CardioAI`), que fica na pasta irmã `../CardioAI` e **não é tocado** por este trabalho.

**Grupo Zion**

| Integrante | RM |
|---|---|
| Cesar Martinho de Azeredo | RM568140 |
| Carlos Alberto Florindo Costato | RM567005 |
| Phellype Matheus Giacoia Flaibam Massarente | RM566826 |

Tutor: **Andre Godoy**. Coordenadora: **Ana Cristina dos Santos**.

Idioma dos entregáveis e da interface: **português do Brasil**.

---

## 2. Estado atual

| Campo | Valor |
|---|---|
| **Etapa em andamento** | **Etapa 3 — ajustes e publicação** concluída em 2026-09-24, aguardando revisão do humano |
| Etapas concluídas | Etapa 1 — fundação (2026-09-23); Etapa 2 — autenticação, pacientes, agendamento, painel, testes, capturas, `docs/hooks.md` (2026-09-24); Etapa 3 — sem sexo, próxima consulta, `PatientsProvider`, GitHub Pages, README final (2026-09-24) |
| Próxima etapa | vídeo (humano) |
| Repositório remoto | **público**: `github.com/Cesar-Azeredo/grupo-zion-cardioia-portal` (criado com `gh` em 2026-09-24, HTTP 200 sem autenticação) |
| Publicação | **GitHub Pages**: `https://cesar-azeredo.github.io/grupo-zion-cardioia-portal/` (workflow `.github/workflows/pages.yml`; HTTP 200 na raiz e em `#/pacientes`, 2026-09-24) |
| Vídeo | **não gravado** — `TODO(humano)` no README |

> **Mantenha esta tabela atualizada.** É o primeiro lugar que qualquer agente olha.

---

## 3. Requisitos literais do enunciado

- Autenticação simulada via **Context API**, com **JWT fake no localStorage**.
- **Listagem de pacientes** com API fake (ex.: JSONPlaceholder) ou base simulada.
- **Formulário de agendamento** de consultas com **useState** e **useReducer**.
- **Dashboard** com contagem de pacientes e de consultas agendadas.
- **Proteção de rotas com AuthContext**: dados só aparecem com usuário logado.
- Estilização com **CSS Modules** ou Styled Components.

**Entregáveis**

- Repositório **público** chamado **`grupo-zion-cardioia-portal`**.
- Pastas **`/contexts`, `/components`, `/services`, `/pages`**.
- `README.md` com **instalação e execução**.
- **Lista de integrantes com nome e RM.**
- **Vídeo de até 4 min no YouTube (não listado)**, com link no README.

### Critérios de avaliação

- Autenticação funcional e proteção de rotas.
- Consumo de API e controle de estado.
- Uso correto de hooks (`useState`, `useEffect`, `useContext`).
- Componentização e organização.
- Estilização responsiva e usabilidade.

---

## 4. Decisões de arquitetura (já tomadas)

1. **Pacientes:** consumo **real** do JSONPlaceholder (`/users`) em `src/services/`, com um **adaptador** que converte usuário em paciente. Campos clínicos simulados (ex.: próxima consulta, status) gerados de forma **determinística a partir do `id`**, sem aleatoriedade.
   - **Minimização (aprovada pelo humano em 2026-09-24):** o adaptador **descarta `email`, `phone` e `address`** (e os demais campos do usuário) e mantém só **`id` e `name`**. É a aplicação do **princípio da necessidade da LGPD** (Lei 13.709/2018, art. 6º, III: tratar só o mínimo necessário à finalidade). Os dados do JSONPlaceholder são fictícios — a decisão **demonstra o hábito de minimização, não mitiga risco real**.
   - Campos clínicos simulados (aprovado em 2026-09-24): só **dados demográficos** (ex.: idade, sexo), marcados como simulados na interface. **Proibido gerar diagnóstico, nível de risco ou qualquer rótulo clínico** — o portal não diagnostica, e rótulo inventado numa tela de saúde confunde.
2. **Consultas:** estado num **`AppointmentsContext` com `useReducer`** (ações de agendar e cancelar), porque o dashboard precisa contar consultas criadas no formulário. O formulário usa **`useState`** para os campos e dispara ações no reducer. Validação: campos obrigatórios e data não pode estar no passado.
3. **Autenticação:** **`AuthContext`** com JWT fake (header.payload.assinatura em base64, com `exp`), gravado no `localStorage` e **validado na carga** (token expirado = deslogado). Credenciais de demonstração documentadas no README. README com aviso de que token em `localStorage` é vulnerável a XSS e que aplicações reais usam cookie `httpOnly`.
4. **Rotas:** `react-router-dom`, com componente **`ProtectedRoute`** que redireciona para `/login` e **devolve o usuário à página que ele tentou abrir**.
5. **Estilo:** **CSS Modules** (nativo do Vite), mobile-first, responsivo. Toda tela que busca dado tem estados de **carregando, erro e vazio**. Rótulos em todos os campos e foco visível.
6. **Nenhum dado pessoal real.** Os nomes do JSONPlaceholder são fictícios. Aviso de simulação acadêmica no **rodapé do portal** e no **README**.

Decisões de implementação da Etapa 2 (2026-09-24):

- **Pasta `src/hooks/`** para hooks próprios que não são de contexto (`usePacientes`, `useTituloPagina`), além das quatro pastas exigidas.
- **Cada contexto em três arquivos** (`XContext.js`, `XProvider.jsx`, `useX.js`), para o lint `react/only-export-components` passar e o hook de acesso falhar com mensagem clara fora do provider.
- ~~Pacientes não ficam num contexto~~ — **substituído na Etapa 3** pelo `PatientsProvider` (abaixo).
- **Sessão sem estado de "carregando":** o `AuthProvider` valida o token na inicialização preguiçosa do `useState`, antes do primeiro render. Um `useEffect` agenda o logout no instante do `exp`.
- **Regras de agendamento no reducer puro** (`agora` e `id` chegam na ação). `agendar()` roda o próprio reducer para obter os erros por campo antes de despachar.
- **Tipos de consulta:** consulta cardiológica, eletrocardiograma, ecocardiograma (os três exemplos do humano).
- **Credenciais de demonstração:** `demo@cardioia.test` / `cardio123` (domínio `.test`, reservado para testes). Sessão de 1 hora.
- **Chaves do localStorage:** `cardioia.auth.token.v1` e `cardioia.consultas.v1` (versionadas).
- ~~Idade e sexo simulados~~ — **sexo removido na Etapa 3** (abaixo). A idade simulada continua: `30 + (id·37 mod 55)`.

Decisões da Etapa 3 (aprovadas pelo humano em 2026-09-24):

- **Sexo removido** do paciente: nenhuma funcionalidade o usa (princípio da necessidade, LGPD art. 6º, III); inferi-lo pelo nome seria outro viés; o valor derivado do `id` contradizia o nome. No lugar, a lista mostra um campo **derivado**: a próxima consulta do paciente (seletor `proximaPorPaciente` do `AppointmentsContext`) ou "sem consulta agendada", e o botão "Agendar" (`/agendamento?paciente=<id>`).
- **`PatientsProvider`:** a lista de pacientes é buscada **uma vez por sessão**. O provider fica em volta das rotas protegidas (`App.jsx`, dentro do `ProtectedRoute`): só busca depois do login e é desmontado no logout. `AbortController` no provider. `usePacientes()` virou o hook de acesso ao contexto (`contexts/usePacientes.js`). `src/hooks/` ficou só com `useTituloPagina`.
- **Roteamento: `HashRouter`** (e não `BrowserRouter` + `404.html`), porque no Pages o fallback responde **HTTP 404** em todo link direto; com hash, tudo responde 200. Comparação em `docs/arquitetura.md`, seção 4. `base` do Vite: `/grupo-zion-cardioia-portal/`, também em dev.
- **Workflow do Pages:** lint → testes → build → deploy; falha em qualquer passo impede a publicação. Actions fixadas nas versões de `gh api repos/<action>/releases/latest` em 2026-09-24: `actions/checkout@v7.0.1`, `actions/setup-node@v7.0.0`, `actions/configure-pages@v6.0.0`, `actions/upload-pages-artifact@v5.0.0`, `actions/deploy-pages@v5.0.1`. Node do CI lido do `.nvmrc`.
- **Capturas** geradas contra a versão publicada (`BASE_URL=… npm run screenshots`), que também confere o link direto para rota protegida, o retorno após o login e o recarregar numa rota interna.

Fatos verificados que afetam a implementação (2026-09-23):

- `https://jsonplaceholder.typicode.com/users` responde **HTTP 200**, JSON com **10 usuários** e campos `id, name, username, email, address, phone, website, company`. O dashboard vai contar 10 pacientes.

---

## 5. Regras de trabalho (valem para toda a sessão)

1. **Nunca invente URL, versão de pacote ou link.** Versões: consultar o que é atual no npm no momento e registrar (seção 7). Link que não se tem vira `TODO(humano)`.
2. **Não fazer push nem criar repositório remoto** sem autorização explícita.
3. **Commits pequenos e temáticos**, Conventional Commits em português, imperativo (ex.: `feat(auth): adiciona AuthContext com JWT fake`).
4. **Antes de encerrar cada etapa, listar o que ficou pendente para o humano.**
5. Não instalar dependência sem registrá-la na seção 7 e fixá-la em versão exata no `package.json`.
6. Requisito ambíguo: **perguntar**, não inventar escopo.

---

## 6. Estrutura de pastas

```
grupo-zion-cardioia-portal/
├── AGENTS.md              # este arquivo
├── CLAUDE.md              # só `@AGENTS.md`
├── README.md              # ENTREGÁVEL: instalação, execução, integrantes, vídeo
├── .nvmrc                 # versão do Node usada no desenvolvimento
├── index.html
├── package.json           # versões exatas (sem ^)
├── vite.config.js
├── .oxlintrc.json         # lint padrão do create-vite (npm run lint)
├── docs/
│   ├── arquitetura.md     # diagrama de contexts/services/pages/components e fluxo de auth
│   ├── hooks.md           # cada hook: onde é usado e por quê
│   └── screenshots/       # capturas 390px e 1280px (npm run screenshots)
├── scripts/
│   └── screenshots.mjs    # Playwright; local (Vite) ou publicado (BASE_URL)
├── .github/workflows/
│   └── pages.yml          # lint, testes, build e deploy no GitHub Pages
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx           # ponto de entrada
    ├── App.jsx            # rotas (react-router-dom); PatientsProvider em volta das protegidas
    ├── index.css          # tokens de cor/espaço, reset e foco visível; o resto é CSS Modules
    ├── test/setup.js      # jest-dom + limpeza entre testes
    ├── contexts/          # AuthContext, AppointmentsContext, PatientsContext (+ provider, hook, reducer)
    ├── components/        # ProtectedRoute, Layout, Rodape, Campo, EstadoTela, CartaoIndicador
    ├── services/          # JSONPlaceholder + adaptador, JWT fake, auth demo, storage, datas
    ├── pages/             # Login, Dashboard, Pacientes, Agendamento
    └── hooks/             # useTituloPagina (hooks que não são de contexto)
```

Cada pasta de `src/` tem um `README.md` curto explicando o que vai nela. Testes ficam ao lado do código (`*.test.js[x]`).

---

## 7. Versões registradas

Consultadas com `npm view <pacote> version` no momento da criação; fixadas **exatas** no `package.json`.

| Item | Versão |
|---|---|
| Node (local, `.nvmrc`) | 24.19.0 |
| npm (local) | 11.17.0 |
| create-vite (scaffold, template `react`) | 9.2.1 |
| vite | 8.3.0 (exige Node `^20.19.0 \|\| >=22.12.0`, registrado em `engines`) |
| @vitejs/plugin-react | 6.1.1 |
| react / react-dom | 19.3.0 |
| react-router-dom | 7.18.4 |
| oxlint | 1.85.0 |
| @types/react / @types/react-dom | 19.3.0 |

Etapa 2 (2026-09-24), também consultadas com `npm view` e fixadas exatas (devDependencies):

| Item | Versão |
|---|---|
| vitest | 5.0.1 (exige Node `^22.12.0 \|\| ^24.0.0 \|\| >=26.0.0`) |
| jsdom | 30.1.1 (exige Node `^22.22.2 \|\| ^24.15.0 \|\| >=26.0.0` — é o que está em `engines`) |
| @testing-library/react | 16.3.3 |
| @testing-library/dom | 10.4.2 |
| @testing-library/jest-dom | 7.0.1 |
| @testing-library/user-event | 14.6.7 |
| playwright | 1.63.0 (navegador: Chrome Headless Shell 153.0.8010.12, `npx playwright install chromium-headless-shell`) |

---

## 8. Checklist antes de encerrar qualquer etapa

1. Cumpri as regras de trabalho da seção 5?
2. Todo link não verificado está como `TODO(humano)` e listado na resposta?
3. Atualizei a tabela de estado da seção 2?
4. `npm run build` passa sem erro?
5. Listei o que ficou pendente para o humano?
