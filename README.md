# CardioIA — Portal (Ir Além 1, Fase 2)

Interface de um portal que simula a rotina de um centro de diagnóstico cardiológico: login, listagem de pacientes, agendamento de consultas e dashboard. Projeto acadêmico do curso de Inteligência Artificial da **FIAP**.

> ⚠️ **Simulação acadêmica.** Não há back-end real nem dado de paciente real. Os nomes vêm do JSONPlaceholder e são fictícios. Nada aqui serve para decisão clínica.

> 🚧 **Em construção — Etapa 1 (fundação).** As funcionalidades ainda não foram implementadas.

## Grupo Zion

| Integrante | RM |
|---|---|
| Cesar Martinho de Azeredo | RM568140 |
| Carlos Alberto Florindo Costato | RM567005 |
| Phellype Matheus Giacoia Flaibam Massarente | RM566826 |

Tutor: Andre Godoy · Coordenadora: Ana Cristina dos Santos

## Privacidade e minimização de dados

A lista de pacientes vem do endpoint `/users` do JSONPlaceholder. O adaptador em `src/services/` **descarta `email`, `phone` e `address`** e mantém só `id` e `name`, aplicando o **princípio da necessidade da LGPD** (Lei 13.709/2018, art. 6º, III: tratar só o mínimo necessário à finalidade). Os dados do JSONPlaceholder são fictícios: a decisão **demonstra o hábito de minimização, não mitiga risco real**.

Idade e sexo exibidos na tela são **simulados**, derivados de forma determinística do `id`. O portal **não gera diagnóstico, nível de risco nem rótulo clínico**.

## Vídeo de demonstração

> ⚠️ TODO(humano): colar aqui o link do vídeo no YouTube (não listado, até 4 min)

## Pré-requisitos

- **Node.js 24.19.0** (versão usada no desenvolvimento, em `.nvmrc`). O Vite 8 aceita Node `^20.19.0 || >=22.12.0`.
- npm (vem com o Node).

## Instalação e execução

```bash
# com nvm (opcional): usa a versão do .nvmrc
nvm use

npm install        # instala as dependências nas versões exatas do package-lock.json
npm run dev        # servidor de desenvolvimento (endereço exibido no terminal)
npm run build      # build de produção em dist/
npm run preview    # serve o build localmente
npm run lint       # lint com oxlint
```

## Stack

React 19.3.0 · Vite 8.3.0 · react-router-dom 7.18.4 · CSS Modules. Versões completas em [`AGENTS.md`](AGENTS.md), seção 7.

## Documentação

- [`docs/arquitetura.md`](docs/arquitetura.md) — como contexts, services, pages e components se conectam, e o fluxo de autenticação.
