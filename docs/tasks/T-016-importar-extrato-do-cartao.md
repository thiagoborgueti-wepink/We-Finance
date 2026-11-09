# T-016 Importar o extrato do cartão corporativo

| Campo | Valor |
|---|---|
| Status | Backlog |
| Fase | 3 |
| Prioridade | Média |
| Responsável | |
| Depende de | T-007 |

## O que fazer

- Importar extrato em CSV ou OFX.
- Guardar cada lançamento com data, descrição, valor e moeda.
- Não armazenar número de cartão.

## Critérios de aceite

- [ ] Reimportar o mesmo extrato não duplica lançamentos.
- [ ] Lançamentos em moeda estrangeira guardam valor original e convertido.
