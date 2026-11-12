# T-008 Exportar ferramentas para CSV

| Campo | Valor |
|---|---|
| Status | Em revisão |
| Fase | 1 |
| Prioridade | Média |
| Responsável | Claude |
| Depende de | T-003 |

## O que fazer

- Exportar todas as colunas do cadastro, mais "Custo mensal (BRL)".
- Codificação UTF-8 com BOM, para abrir certo no Excel.
- Respeitar o filtro de centro de custo ativo, com opção de exportar tudo.

## Critérios de aceite

- [ ] O arquivo abre no Excel com acentos corretos (conferir no preview).
- [x] O arquivo reimporta pela T-007 sem ajuste.
