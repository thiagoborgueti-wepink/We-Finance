# Quadro de tarefas

Atualizado em 12/11/2026.

Como usar: cada tarefa tem um arquivo em [tasks/](tasks/). Para mover uma tarefa, altere o campo `Status` no arquivo e mova a linha para a coluna certa aqui, no mesmo commit. Tarefa nova: copie [tasks/_TEMPLATE.md](tasks/_TEMPLATE.md) com o próximo número livre.

Prioridade: 🔴 Alta · 🟡 Média · ⚪ Baixa

## 🚨 Atenção imediata

- 🔴 [T-022 Regularizar o pagamento do PlanetScale](tasks/T-022-regularizar-planetscale.md): bancos entram em sleep em **15/11/2026**.

## A fazer

| Tarefa | Fase | Prioridade | Responsável |
|---|---|---|---|
| [T-022 Regularizar o pagamento do PlanetScale](tasks/T-022-regularizar-planetscale.md) | Operacional | 🔴 | Financeiro |
| [T-003 Construir o cadastro de ferramentas](tasks/T-003-cadastro-de-ferramentas.md) | 1 | 🔴 | |
| [T-004 Separar custos por centro de custo](tasks/T-004-centro-de-custo.md) | 1 | 🔴 | |
| [T-006 Mostrar vencimentos e alertas visuais](tasks/T-006-vencimentos-e-alertas.md) | 1 | 🔴 | |
| [T-005 Montar o painel de resumo](tasks/T-005-painel-de-resumo.md) | 1 | 🟡 | |
| [T-007 Importar ferramentas por CSV](tasks/T-007-importacao-csv.md) | 1 | 🟡 | |
| [T-008 Exportar ferramentas para CSV](tasks/T-008-exportacao-csv.md) | 1 | 🟡 | |
| [T-009 Migrar os dados do protótipo](tasks/T-009-migrar-dados-do-prototipo.md) | 1 | 🟡 | |
| [T-023 Levantar valores de Frenet, OneSignal e Redis Cloud](tasks/T-023-levantar-valores-pendentes.md) | Operacional | 🟡 | Financeiro |
| [T-024 Confirmar data e uso variável do Vercel](tasks/T-024-confirmar-cobranca-vercel.md) | Operacional | 🟡 | Financeiro |

## Em andamento

| Tarefa | Fase | Prioridade | Responsável |
|---|---|---|---|
| [T-026 Login mínimo com e-mail e senha](tasks/T-026-login-minimo.md) | 1 | 🔴 | Claude |

## Backlog

| Tarefa | Fase | Prioridade | Responsável |
|---|---|---|---|
| [T-010 Definir orçamento por centro de custo](tasks/T-010-orcamento-por-centro.md) | 1 | 🟡 | |
| [T-011 Buscar a cotação do dólar automaticamente](tasks/T-011-cotacao-automatica.md) | 1 | 🟡 | |
| [T-012 Registrar o histórico de alterações](tasks/T-012-historico-de-alteracoes.md) | 1 | 🟡 | |
| [T-013 Enviar avisos antes do vencimento](tasks/T-013-avisos-de-vencimento.md) | 2 | 🔴 | |
| [T-015 Ler faturas da caixa de e-mail com fila de revisão](tasks/T-015-leitura-de-faturas-por-email.md) | 2 | 🟡 | |
| [T-014 Publicar calendário de vencimentos (iCal)](tasks/T-014-calendario-ical.md) | 2 | ⚪ | |
| [T-016 Importar o extrato do cartão corporativo](tasks/T-016-importar-extrato-do-cartao.md) | 3 | 🟡 | |
| [T-017 Criar regras de conciliação](tasks/T-017-regras-de-conciliacao.md) | 3 | 🟡 | |
| [T-018 Anexar nota fiscal ou recibo ao lançamento](tasks/T-018-anexo-de-nota-fiscal.md) | 3 | ⚪ | |
| [T-019 Controlar assentos por ferramenta](tasks/T-019-assentos-por-ferramenta.md) | 3 | ⚪ | |
| [T-020 Implementar login corporativo e perfis](tasks/T-020-login-e-perfis.md) | 4 | 🟡 | |
| [T-025 Habilitar login com Microsoft (SSO)](tasks/T-025-sso-microsoft.md) | 4 | 🟡 | Claude · TI |
| [T-021 Empacotar como projeto open source](tasks/T-021-empacotamento-open-source.md) | 4 | ⚪ | |

## Feito

Entregas do protótipo, já validadas:

- Protótipo publicado da Central de Assinaturas (inventário, resumo, vencimentos, roadmap).
- Importação de CSV com prévia e exportação de CSV no protótipo.
- Centro de custo no protótipo (filtro e custo por centro).
- Carga das 11 ferramentas da caixa appwepink no centro APP, responsável Financeiro.
- Pesquisa de projetos open source de referência ([REFERENCIAS.md](REFERENCIAS.md)).
- Banco (Supabase) e hospedagem (Vercel) definidos ([ADR-001](decisoes/ADR-001-stack.md)).
- Framework Next.js + TypeScript aprovado ([ADR-002](decisoes/ADR-002-framework.md)).
- [T-001 Definir stack e estrutura do repositório](tasks/T-001-definir-stack.md): scaffold Next.js no ar (PR #1).
- [T-002 Modelar os dados de ferramentas e centros de custo](tasks/T-002-modelo-de-dados.md): tabelas com RLS aplicadas no Supabase (PR #2).
