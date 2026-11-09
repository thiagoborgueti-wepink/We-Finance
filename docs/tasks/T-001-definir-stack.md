# T-001 Definir stack e estrutura do repositório

| Campo | Valor |
|---|---|
| Status | Feito |
| Fase | 1 |
| Prioridade | Alta |
| Responsável | |
| Depende de | |

## Contexto

O protótipo roda como página publicada no Claude, com banco próprio da plataforma. Para virar produto e, depois, projeto open source, precisamos de uma stack que o Claude construa e mantenha (modelo AI-first, ver [CLAUDE.md](../../CLAUDE.md)) e que rode em Docker.

## O que fazer

- Escolher linguagem, framework, banco de dados e forma de hospedagem.
- Registrar a decisão em `docs/decisoes/ADR-001-stack.md` (contexto, opções, escolha, consequências).
- Criar a estrutura inicial de pastas e o README de desenvolvimento.

## Critérios de aceite

- [ ] ADR proposto pelo Claude e aprovado pelo PO.
- [ ] Repositório com estrutura inicial e instruções para rodar localmente.
- [ ] A stack roda em Docker (requisito da Fase 4).

## Notas

Decidido em 09/11/2026 ([ADR-001](../decisoes/ADR-001-stack.md)):

- [x] Banco: Supabase (Postgres, Auth, Storage).
- [x] Hospedagem: Vercel, projeto `wefinance`.
- [x] Framework: Next.js + TypeScript, aprovado no [ADR-002](../decisoes/ADR-002-framework.md).
- [x] Scaffold na branch `t-001-scaffold`: clientes do Supabase, `proxy.ts` de sessão, Vitest, Supabase CLI, `vercel.json`.
- [x] PO revisou o preview e fez o merge (PR #1, 09/11/2026).
- [ ] Habilitar o ambiente Development na integração do Supabase, para `vercel env pull` funcionar localmente (pendente com o PO).
- [x] Pasta local ligada ao projeto Vercel (`vercel link`).
- [x] Variáveis do Supabase no Vercel via integração do Marketplace (Production e Preview).
- [ ] Habilitar o ambiente Development na integração, para `vercel env pull` funcionar localmente.
- [x] Repositório GitHub conectado ao projeto Vercel (deploy automático da `main` e preview por PR).
