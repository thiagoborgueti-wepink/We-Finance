# T-006 Mostrar vencimentos e alertas visuais

| Campo | Valor |
|---|---|
| Status | Em revisão |
| Fase | 1 |
| Prioridade | Alta |
| Responsável | Claude |
| Depende de | T-003 |

## Contexto

A dor principal: cobranças que vencem sem ninguém ver, como o PlanetScale em out/26.

## O que fazer

- Lista "Próximos 60 dias", ordenada por data.
- Situação de cada ferramenta: Vencida há N dias (crítico), Vence em até 7 dias (atenção), Sem responsável (atenção), A cancelar, Pausada, Em dia.

## Critérios de aceite

- [x] Uma cobrança com data passada aparece como vencida, em destaque.
- [x] Os alertas usam texto além da cor (acessibilidade).
