# CardioIA — Portal (Ir Além 1, Fase 2)

Interface de um portal que simula a rotina de um centro de diagnóstico cardiológico: login, listagem de pacientes, agendamento de consultas e painel. Projeto acadêmico do curso de Inteligência Artificial da **FIAP**.

> ⚠️ **Simulação acadêmica.** Não há back-end real nem dado de paciente real. Os nomes vêm do JSONPlaceholder e são fictícios. Nada aqui serve para decisão clínica.

![Painel no desktop](docs/screenshots/dashboard-1280.png)

## Grupo Zion

| Integrante | RM |
|---|---|
| Cesar Martinho de Azeredo | RM568140 |
| Carlos Alberto Florindo Costato | RM567005 |
| Phellype Matheus Giacoia Flaibam Massarente | RM566826 |

Tutor: Andre Godoy · Coordenadora: Ana Cristina dos Santos

## Vídeo de demonstração

> ⚠️ TODO(humano): colar aqui o link do vídeo no YouTube (não listado, até 4 min)

## Funcionalidades

| Requisito do enunciado | Como foi atendido |
|---|---|
| Autenticação simulada via Context API, com JWT fake no localStorage | `AuthContext` + `useAuth()`; token `header.payload.assinatura` em base64url com `exp`, validado na carga (expirado, malformado ou adulterado = deslogado) e com logout automático no vencimento |
| Listagem de pacientes com API fake | consumo real de `https://jsonplaceholder.typicode.com/users`, com adaptador; busca por nome; estados de carregando, erro (com "Tentar de novo") e vazio |
| Formulário de agendamento com useState e useReducer | campos em `useState`; consultas num `AppointmentsContext` com `useReducer` (agendar e cancelar); regras **no reducer**: obrigatórios, sem data/hora no passado, sem o mesmo paciente duas vezes no mesmo horário; persistência no localStorage |
| Dashboard com contagem de pacientes e consultas | total de pacientes, consultas futuras, consultas de hoje e distribuição por tipo |
| Proteção de rotas com AuthContext | `ProtectedRoute` manda para `/login` e, depois do login, **devolve à página que se tentou abrir** |
| CSS Modules | um `.module.css` por componente/página; mobile-first, testado em 390px e 1280px |

Uso de cada hook: [`docs/hooks.md`](docs/hooks.md). Arquitetura e fluxo de autenticação: [`docs/arquitetura.md`](docs/arquitetura.md).

## Credenciais de demonstração

| Campo | Valor |
|---|---|
| E-mail | `demo@cardioia.test` |
| Senha | `cardio123` |

A sessão dura 1 hora. As credenciais também aparecem na tela de login.

> 🔒 **Aviso de segurança.** O token fica no `localStorage` só para fins didáticos, como pede o enunciado. `localStorage` é legível por qualquer script da página, portanto **vulnerável a XSS**. Aplicações reais guardam o token em **cookie `httpOnly`** emitido pelo servidor e validam a assinatura no back-end. A "assinatura" deste JWT fake não é criptográfica.

## Privacidade e minimização de dados

A lista de pacientes vem do endpoint `/users` do JSONPlaceholder. O adaptador em `src/services/` **descarta `email`, `phone` e `address`** e mantém só `id` e `name`, aplicando o **princípio da necessidade da LGPD** (Lei 13.709/2018, art. 6º, III: tratar só o mínimo necessário à finalidade). Os dados do JSONPlaceholder são fictícios: a decisão **demonstra o hábito de minimização, não mitiga risco real**.

Idade e sexo exibidos na tela são **simulados**, derivados de forma determinística do `id`, e não têm relação com o nome. O portal **não gera diagnóstico, nível de risco nem rótulo clínico**.

## Pré-requisitos

- **Node.js 24.19.0** (versão usada no desenvolvimento, em `.nvmrc`). O `package.json` aceita Node `^22.22.2 || ^24.15.0 || >=26.0.0` (exigência do jsdom usado nos testes; o Vite sozinho aceita `^20.19.0 || >=22.12.0`).
- npm (vem com o Node).
- Internet, para a lista de pacientes (JSONPlaceholder).

## Instalação e execução

```bash
# com nvm (opcional): usa a versão do .nvmrc
nvm use

npm install          # instala as dependências nas versões exatas do package-lock.json
npm run dev          # servidor de desenvolvimento (endereço exibido no terminal)
npm run build        # build de produção em dist/
npm run preview      # serve o build localmente
npm run lint         # lint com oxlint
npm test             # testes (Vitest + Testing Library + jsdom)
```

### Capturas de tela

```bash
npx playwright install chromium-headless-shell   # uma vez: baixa o navegador do Playwright
npm run screenshots                              # gera docs/screenshots/
```

O script sobe o Vite, entra com as credenciais de demonstração, agenda consultas pelo formulário e fotografa cada página em 390px e 1280px. Ele falha se alguma página tiver rolagem horizontal.

## Telas

| | Celular (390px) | Desktop (1280px) |
|---|---|---|
| Login | [login-390](docs/screenshots/login-390.png) | [login-1280](docs/screenshots/login-1280.png) |
| Painel | [dashboard-390](docs/screenshots/dashboard-390.png) | [dashboard-1280](docs/screenshots/dashboard-1280.png) |
| Pacientes | [pacientes-390](docs/screenshots/pacientes-390.png) | [pacientes-1280](docs/screenshots/pacientes-1280.png) |
| Agendamento | [agendamento-390](docs/screenshots/agendamento-390.png) | [agendamento-1280](docs/screenshots/agendamento-1280.png) |
| Agendamento com erros | [agendamento-erros-390](docs/screenshots/agendamento-erros-390.png) | [agendamento-erros-1280](docs/screenshots/agendamento-erros-1280.png) |

## Estrutura

```
src/
├── contexts/     # AuthContext e AppointmentsContext (provider + hook de acesso), reducer das consultas
├── components/   # ProtectedRoute, Layout, Rodape, Campo, EstadoTela, CartaoIndicador
├── services/     # JSONPlaceholder + adaptador, JWT fake, credenciais demo, storage, datas
├── pages/        # Login, Dashboard, Pacientes, Agendamento
└── hooks/        # usePacientes, useTituloPagina
```

Os testes ficam ao lado do código testado (`*.test.js` / `*.test.jsx`).

## Stack

React 19.3.0 · Vite 8.3.0 · react-router-dom 7.18.4 · CSS Modules · Vitest 5.0.1 · Testing Library · Playwright 1.63.0 (só para capturas). Versões completas em [`AGENTS.md`](AGENTS.md), seção 7.
