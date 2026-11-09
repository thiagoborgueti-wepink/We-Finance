# T-021 Empacotar como projeto open source

| Campo | Valor |
|---|---|
| Status | Backlog |
| Fase | 4 |
| Prioridade | Baixa |
| Responsável | |
| Depende de | T-001, T-020 |

## O que fazer

- Escolher a licença (ex.: MIT, Apache-2.0 ou AGPL-3.0) e registrar a decisão em ADR.
- Dockerfile e docker-compose com banco incluso.
- README de instalação, variáveis de ambiente documentadas, dados de exemplo fictícios.
- Revisar o repositório para não expor dados reais da WePink (valores, contas, e-mails).

## Critérios de aceite

- [ ] `docker compose up` sobe a aplicação do zero com dados fictícios.
- [ ] Nenhum dado real ou segredo no histórico do git.
