# T-011 Buscar a cotação do dólar automaticamente

| Campo | Valor |
|---|---|
| Status | Backlog |
| Fase | 1 |
| Prioridade | Média |
| Responsável | |
| Depende de | T-005 |

## Contexto

Ideia inspirada no Wallos. A cotação digitada à mão distorce os totais de ferramentas em USD (PlanetScale, Vercel, GitHub, Apple).

## O que fazer

- Buscar a cotação USD → BRL uma vez por dia em fonte pública (ex.: PTAX do Banco Central).
- Mostrar a data e a fonte da cotação usada.
- Permitir sobrescrever manualmente.

## Critérios de aceite

- [ ] Se a fonte falhar, usa a última cotação salva e avisa a data.
- [ ] Nenhuma chave de API fica no código.
