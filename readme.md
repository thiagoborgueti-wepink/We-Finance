# We-Finance

Central de assinaturas da WePink: controla as ferramentas pagas pelos times (Apple Developer, Vercel, GitHub, PlanetScale, Notion e outras), quanto custam, quando vencem, quem responde por cada conta e a qual centro de custo pertencem.

O objetivo é que o time financeiro tenha uma visão única dos pagamentos de ferramentas, sem depender de planilhas soltas ou de alguém lembrar a data de renovação.

## Problema

- Cobranças vencem sem ninguém perceber (ex.: PlanetScale com cartão recusado em set e out/26).
- Não há visão de custo por centro de custo (APP, Marketing etc.).
- Faturas chegam em caixas de e-mail diferentes (ex.: appwepink@wepink.com.br) e não são conciliadas com o cartão.
- Não se sabe quem é dono de cada conta nem quantos assentos pagamos.

## Escopo

| Fase | Entrega | Status |
|---|---|---|
| 1 | Inventário, centro de custo, vencimentos, importação e exportação de CSV | Protótipo validado; produto a construir |
| 2 | Avisos de vencimento e leitura de faturas por e-mail | A fazer |
| 3 | Conciliação com extrato do cartão e nota fiscal | A fazer |
| 4 | Projeto open source: login, perfis, Docker | A fazer |

Detalhes em [docs/ROADMAP.md](docs/ROADMAP.md).

## Como trabalhamos

As tarefas ficam em Markdown dentro do próprio repositório, não no GitHub Projects:

- [docs/BOARD.md](docs/BOARD.md): o quadro, com as colunas Backlog, A fazer, Em andamento e Feito.
- [docs/tasks/](docs/tasks/): um arquivo por tarefa, com descrição e critérios de aceite.
- [docs/tasks/_TEMPLATE.md](docs/tasks/_TEMPLATE.md): modelo para criar uma tarefa nova.

Para mover uma tarefa, altere o campo `Status` no arquivo dela e mova a linha correspondente no `BOARD.md` no mesmo commit.

## Referências

Projetos open source estudados apenas como inspiração de funcionalidades. Nenhum código deles é usado aqui.

| Projeto | Ideia aproveitada |
|---|---|
| Wallos | Lembretes de vencimento, cotação automática de moeda, login corporativo |
| Renewlet | Orçamento por categoria, vários canais de aviso, calendário |
| Firefly III | Regras automáticas para conciliar lançamentos |
| Snipe-IT | Controle de assentos e histórico de alterações |

Comparativo completo em [docs/REFERENCIAS.md](docs/REFERENCIAS.md).

## Licença

A definir antes da Fase 4 (ver tarefa [T-021](docs/tasks/T-021-empacotamento-open-source.md)).
