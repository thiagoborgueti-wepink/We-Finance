# T-015 Ler faturas da caixa de e-mail com fila de revisão

| Campo | Valor |
|---|---|
| Status | Backlog |
| Fase | 2 |
| Prioridade | Média |
| Responsável | |
| Depende de | T-003 |

## Contexto

As faturas das ferramentas do APP chegam em appwepink@wepink.com.br. A busca na caixa pessoal do PO achou quase nada.

## O que fazer

- Conectar à caixa appwepink@wepink.com.br com acesso só de leitura.
- Identificar e-mails de cobrança por remetente e assunto (Apple, Vercel, GitHub, PlanetScale, Anthropic, Sectigo, Frenet, OneSignal, Redis).
- Extrair ferramenta, valor, moeda, data e link do e-mail.
- Fila de revisão: cada leitura vira uma sugestão; só entra no cadastro após aprovação.

## Critérios de aceite

- [ ] Nada é gravado sem aprovação humana.
- [ ] Falhas de pagamento (cartão recusado) geram alerta, como no caso do PlanetScale.
- [ ] Credenciais da caixa ficam fora do código.
