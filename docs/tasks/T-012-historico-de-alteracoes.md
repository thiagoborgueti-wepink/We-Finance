# T-012 Registrar o histórico de alterações

| Campo | Valor |
|---|---|
| Status | Em revisão |
| Fase | 1 |
| Prioridade | Média |
| Responsável | Claude |
| Depende de | T-003 |

## Contexto

Ideia inspirada no Snipe-IT. O financeiro precisa auditar quem mudou valor, data ou responsável.

## O que fazer

- Registrar cada criação, edição e exclusão: quem, quando, campo, valor anterior e novo.
- Mostrar o histórico dentro da ferramenta.

## Critérios de aceite

- [x] Importações por CSV também geram histórico.
- [x] O histórico não pode ser editado pela interface.

## Notas

O "quem" depende de login (T-020). Até lá, registrar o que estiver disponível.
