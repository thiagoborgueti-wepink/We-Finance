# ADR-001 Stack do We-Finance

| Campo | Valor |
|---|---|
| Status | Parcialmente decidido |
| Data | 09/11/2026 |
| Tarefa | [T-001](../tasks/T-001-definir-stack.md) |

## Contexto

O protótipo rodava como página publicada no Claude, com banco da própria plataforma. O produto precisa de um banco que o time de dev mantenha, com autenticação e armazenamento de arquivos, e que possa ser reproduzido por quem usar o projeto open source.

## Decisão

### Banco de dados: Supabase (decidido)

O banco é um projeto Supabase da WePink (Postgres gerenciado). O identificador do projeto e as chaves ficam apenas em variáveis de ambiente (`.env`), nunca no repositório. Ver [`.env.example`](../../.env.example).

O Supabase também cobre outras necessidades do roadmap:

| Necessidade | Recurso do Supabase | Tarefa |
|---|---|---|
| Tabelas de ferramentas, centros de custo, histórico | Postgres + migrações via Supabase CLI | T-002, T-012 |
| Permissões por perfil (financeiro, dev, leitura) | Row Level Security (RLS) | T-020 |
| Login com conta Google da empresa | Supabase Auth (provedor Google) | T-020 |
| Anexo de nota fiscal | Supabase Storage | T-018 |
| Rotina diária de avisos e cotação | Edge Functions + pg_cron | T-011, T-013 |

### Hospedagem: Vercel (decidido)

A aplicação roda num projeto Vercel da WePink (`wefinance`), com deploy a partir da branch `main` deste repositório e preview a cada pull request. As variáveis do Supabase ficam nas Environment Variables do projeto Vercel, separadas por ambiente (Production, Preview, Development).

### Framework (pendente)

A definir pelo time de dev. Como a hospedagem é Vercel e o banco é Supabase, Next.js é a opção mais direta (suporte nativo no Vercel e integração oficial do Supabase), mas a escolha fica com o time.

## Consequências

- Migrações versionadas em `supabase/migrations/`, aplicadas pela Supabase CLI.
- RLS habilitado em todas as tabelas desde a primeira migração.
- A chave `service_role` nunca vai para o frontend nem para o repositório.
- Para o open source (T-021), o projeto deve subir também com Supabase local (`supabase start`), sem depender do projeto da WePink.
- As rotinas agendadas (avisos, cotação) podem rodar como Vercel Cron Jobs ou como Edge Functions do Supabase com pg_cron. Decidir na T-013.
- Para o open source, além do Vercel, o projeto deve rodar em Docker (T-021).
