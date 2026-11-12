# T-002 Modelar os dados de ferramentas e centros de custo

| Campo | Valor |
|---|---|
| Status | Em andamento |
| Fase | 1 |
| Prioridade | Alta |
| Responsável | |
| Depende de | T-001 |

## Contexto

O protótipo guarda cada ferramenta como um documento com campos livres. O produto precisa de um modelo explícito, que sustente as fases seguintes (avisos, conciliação, assentos).

## O que fazer

- Entidade **Ferramenta**: nome, centro de custo, categoria, responsável, conta de login, valor, moeda (BRL ou USD), ciclo (mensal ou anual), próxima cobrança, forma de pagamento (texto, nunca número de cartão), situação (ativa, a cancelar, pausada), observações.
- Entidade **Centro de custo**: nome (ex.: APP), orçamento mensal opcional.
- Categorias iniciais: Infra e deploy, Lojas de app, Produtividade, Analytics, Design, IA, Outros.
- Documentar o modelo em `docs/MODELO-DE-DADOS.md`.

## Critérios de aceite

- [ ] Migrações em `supabase/migrations/` criam as tabelas no Supabase.
- [ ] RLS habilitado em todas as tabelas.
- [ ] Nenhum campo armazena número de cartão ou dado bancário.
- [ ] Ciclos com período maior que um ano (ex.: certificado SSL de 3 anos) têm forma clara de registro.

## Andamento (branch `t-002-modelo-de-dados`)

- [x] Migração `supabase/migrations/20261109202343_modelo_inicial.sql`: tabelas `ferramentas`, `centros_custo`, `categorias`, `dominios_permitidos`, com RLS.
- [x] Ciclo em meses (`ciclo_meses`), resolvendo o caso de 3 anos da Sectigo; regra de custo e testes atualizados.
- [x] Números de cartão recusados por regra no banco (`forma_pagamento` e `observacoes`).
- [x] Acesso restrito a domínios de e-mail autorizados, porque o Supabase permite cadastro aberto por padrão.
- [x] `supabase/seed.sql` com dados fictícios e [MODELO-DE-DADOS.md](../MODELO-DE-DADOS.md).
- [x] Sintaxe SQL validada com o parser do Postgres (`libpg-query`).
- [ ] Rodar a migração num banco real (local com Docker, ou no Supabase após o merge).
- [ ] Aplicar no projeto Supabase e cadastrar o domínio da empresa em `dominios_permitidos`.

## Notas

No protótipo a Sectigo (R$ 1.614,00 por 3 anos) foi lançada como R$ 538,00 por ano, por falta de ciclo plurianual. Corrigir no modelo.
