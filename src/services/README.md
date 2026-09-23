# services/

Acesso a dados e lógica sem React (funções puras, testáveis isoladamente).

- Cliente do JSONPlaceholder (`/users`) + **adaptador** usuário → paciente. Campos clínicos simulados são derivados **deterministicamente do `id`** (sem `Math.random`).
- Geração, leitura e validação do JWT fake (header.payload.assinatura em base64url, com `exp`).

Nenhum dado pessoal real: os nomes do JSONPlaceholder são fictícios.
