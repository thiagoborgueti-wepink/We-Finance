# Referências open source

Projetos estudados como inspiração. Não usamos código deles: a decisão foi construir o We-Finance do zero e aproveitar apenas as ideias.

Levantamento feito em 04/11/2026 a partir dos READMEs no GitHub. Datas de último commit não estavam visíveis; conferir antes de citar como referência ativa.

| Projeto | O que é | Licença | Ideias que aproveitamos | Por que não usar direto |
|---|---|---|---|---|
| [Wallos](https://github.com/ellite/wallos) | Controle de assinaturas self-hosted (PHP, SQLite), 8,6 mil estrelas | GPL-3.0 | Lembretes de vencimento, multimoeda com cotação automática, calendário, notificações por vários canais, login OIDC | Pensado para uso doméstico; sem centro de custo, aprovação ou importação de CSV descritos |
| [Renewlet](https://github.com/zhiyingzzhou/renewlet) | Controle de assinaturas (Docker ou Cloudflare), 285 estrelas | MIT | Orçamento por categoria, dez canais de aviso, calendário, importação e exportação | Projeto pequeno; API só de leitura; multiusuário não confirmado |
| [Firefly III](https://github.com/firefly-iii/firefly-iii) | Gestor de finanças pessoais (PHP), 25 mil estrelas | AGPL-3.0 | Regras automáticas de classificação, importação de extrato, recorrências | Foco em finanças pessoais, sem conceito de assinatura de empresa |
| [Snipe-IT](https://github.com/snipe/snipe-it) | Gestão de ativos de TI e licenças (Laravel), 15 mil estrelas | AGPL-3.0 | Assentos por licença, histórico de alterações | Pensado para hardware; pesado para o nosso volume |
| [Akaunting](https://github.com/akaunting/akaunting) | Contabilidade para pequenas empresas (Laravel), 10 mil estrelas | BSL | Nenhuma relevante | Licença BSL não é open source em sentido estrito; é contabilidade completa |

## O que nenhum deles resolve

Nenhum dos projetos lidos traz centro de custo nativo, que é a necessidade principal do financeiro. Esse é o diferencial do We-Finance.
