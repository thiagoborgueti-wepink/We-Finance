# T-007 Importar ferramentas por CSV

| Campo | Valor |
|---|---|
| Status | Em revisão |
| Fase | 1 |
| Prioridade | Média |
| Responsável | Claude |
| Depende de | T-003, T-004 |

## Contexto

O financeiro mantém listas em planilha. A importação evita cadastro manual.

## O que fazer

- Aceitar separador vírgula, ponto e vírgula ou tab, e arquivos com BOM do Excel.
- Reconhecer colunas pelo nome: Ferramenta, Centro de custo, Categoria, Responsável, Conta, Valor, Moeda, Ciclo, Próxima cobrança, Forma de pagamento, Situação, Observações. Obrigatórias: Ferramenta e Valor.
- Entender valores como "R$ 1.800,00" e "US$ 36,00" e datas DD/MM/AAAA ou AAAA-MM-DD.
- Prévia antes de gravar, marcando cada linha como nova, já existe ou com erro.
- Duplicadas por nome + centro de custo: pular, ou atualizar se o usuário marcar.
- Modelo de CSV para download.

## Critérios de aceite

- [x] Nada é gravado antes de o usuário confirmar a prévia.
- [x] O CSV exportado (T-008) pode ser reimportado sem ajuste.
- [x] Limite de 500 linhas e 2 MB, com mensagem clara.

## Notas

O CSV real da caixa appwepink tinha texto livre nas colunas de valor e data (ex.: "US$ 753,71 (set/26); jun–ago entre..."). Linhas assim devem cair como erro na prévia, não ser lidas pela metade.
