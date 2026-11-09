# T-014 Publicar calendário de vencimentos (iCal)

| Campo | Valor |
|---|---|
| Status | Backlog |
| Fase | 2 |
| Prioridade | Baixa |
| Responsável | |
| Depende de | T-006 |

## O que fazer

- Endpoint que gera um calendário `.ics` com as próximas cobranças, filtrável por centro de custo.
- URL com token secreto para assinar no Google Agenda.

## Critérios de aceite

- [ ] O calendário atualiza sozinho no Google Agenda quando uma data muda.
- [ ] O token pode ser revogado e regenerado.
