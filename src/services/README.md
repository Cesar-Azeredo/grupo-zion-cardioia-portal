# services/

Acesso a dados e lógica sem React (funções puras, testáveis isoladamente).

- `pacientesService.js` — cliente do JSONPlaceholder (`/users`) + **adaptador** usuário → paciente. Mantém só `id` e `name` (minimização, LGPD art. 6º, III); idade e sexo **simulados**, derivados deterministicamente do `id`. Nenhum rótulo clínico.
- `jwtFake.js` — gera, decodifica e valida o JWT fake (header.payload.assinatura em base64url, com `exp`).
- `authService.js` — credenciais de demonstração e emissão do token.
- `storage.js` — leitura e gravação no `localStorage` com `try/catch`.
- `datas.js` — datas no fuso local (formato dos `<input type="date">` e `type="time"`).

Nenhum dado pessoal real: os nomes do JSONPlaceholder são fictícios.
