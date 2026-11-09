# T-013 Enviar avisos antes do vencimento

| Campo | Valor |
|---|---|
| Status | Backlog |
| Fase | 2 |
| Prioridade | Alta |
| Responsável | |
| Depende de | T-006 |

## Contexto

Ideia inspirada no Wallos e no Renewlet. Hoje o alerta só aparece quando alguém abre a página.

## O que fazer

- Rotina diária que verifica cobranças nos próximos N dias (padrão: 7 e 1 dia antes) e vencidas.
- Enviar aviso por Slack e por e-mail para o responsável e o financeiro.
- Configuração de canais e antecedência por centro de custo.

## Critérios de aceite

- [ ] Um aviso por cobrança por marco (7 dias, 1 dia, vencida), sem repetição.
- [ ] Falha de envio fica registrada e não trava os demais avisos.

## Notas

Decidir com o financeiro qual canal é o principal antes de começar.
