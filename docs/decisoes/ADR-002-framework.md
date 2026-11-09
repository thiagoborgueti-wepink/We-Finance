# ADR-002 Framework e bibliotecas da aplicação

| Campo | Valor |
|---|---|
| Status | **Aprovado** pelo PO em 09/11/2026 |
| Data | 09/11/2026 |
| Proposto por | Claude |
| Tarefa | [T-001](../tasks/T-001-definir-stack.md) |
| Depende de | [ADR-001](ADR-001-stack.md) (Supabase e Vercel) |

## Contexto

Banco (Supabase) e hospedagem (Vercel) já estão decididos. Falta o framework da aplicação.

Restrições que pesam na escolha:

- O Claude constrói e mantém o código (modelo AI-first, ver [CLAUDE.md](../../CLAUDE.md)). A stack deve ser bem documentada e convencional, para que qualquer sessão nova retome o trabalho sem ambiguidade.
- O produto **não terá recursos de IA**. Leitura de faturas, importação e conciliação usam regras e parsers determinísticos.
- Volume pequeno: cerca de 20 ferramentas e poucos usuários (financeiro e PO).
- Precisa rodar no Vercel agora e em Docker na Fase 4 (open source).
- Login com Google da empresa e permissões por perfil via Supabase (T-020).

## Opções avaliadas

| Opção | Prós | Contras |
|---|---|---|
| **Next.js (App Router) + TypeScript** | Suporte nativo no Vercel; integração oficial do Supabase (`@supabase/ssr`) com login no servidor; Server Actions dispensam uma API separada; Vercel Cron Jobs para avisos; build `standalone` para Docker | Mais conceitos (Server e Client Components, cache) do que um SPA simples |
| React Router (Remix) + TypeScript | Modelo de dados por rota simples; roda bem no Vercel | Integração com Supabase e Vercel menos direta; menos exemplos oficiais |
| SvelteKit | Código enxuto, bom desempenho | Ecossistema de componentes menor; menos material de referência com Supabase |
| SPA com Vite + Supabase direto no navegador | Mais simples de começar | Toda regra de negócio no cliente, dependendo só do RLS; rotinas agendadas e importações pesadas precisariam de outro serviço |

## Decisão proposta

**Next.js com App Router e TypeScript**, versão estável mais recente no momento do scaffold.

| Camada | Escolha | Uso |
|---|---|---|
| Linguagem | TypeScript (modo `strict`) | Todo o código |
| Framework | Next.js (App Router, Server Components, Server Actions) | Telas e regras de negócio no servidor |
| Banco e login | `@supabase/supabase-js` + `@supabase/ssr` | Sessão em cookies, consultas no servidor |
| Tipos do banco | `supabase gen types` | Tipos gerados a partir das migrações |
| Migrações | Supabase CLI (`supabase/migrations/`) | Versionamento do schema, RLS |
| Interface | Tailwind CSS + shadcn/ui | Componentes acessíveis, código dentro do repositório |
| Validação | Zod | Formulários e linhas do CSV (T-007) |
| CSV | Papa Parse | Importação (T-007) e exportação (T-008) |
| Datas e moeda | `Intl` nativo do JavaScript | Formatação em pt-BR, sem biblioteca extra |
| Testes | Vitest (regras e parsers) + Playwright (fluxos principais) | Cálculo de custo, importação, alertas |
| Rotinas agendadas | Vercel Cron Jobs chamando rotas protegidas | Cotação do dólar (T-011) e avisos (T-013) |
| Gerenciador de pacotes | npm | Já instalado na máquina do PO |
| Docker (Fase 4) | Build `output: "standalone"` do Next.js | T-021 |

## Estrutura de pastas proposta

```
src/
  app/                 # rotas e telas (App Router)
    (app)/ferramentas/ # cadastro e tabela
    (app)/centros/     # centros de custo
    api/cron/          # rotas chamadas pelo Vercel Cron
  components/          # componentes de interface (shadcn/ui em components/ui)
  lib/
    supabase/          # clientes do Supabase (servidor e navegador)
    custos/            # regras puras: custo mensal, conversão, alertas
    csv/               # parser e exportação de CSV
  types/               # tipos gerados do banco
supabase/
  migrations/          # SQL versionado, com RLS
  seed.sql             # dados fictícios para desenvolvimento
tests/                 # Playwright
```

As regras de negócio (cálculo de custo mensal, situação de vencimento, parser de CSV) ficam em `src/lib` como funções puras, testadas com Vitest e independentes do framework.

## Consequências

- O Claude faz o scaffold na branch `t-001-scaffold`, com um pull request que gera preview no Vercel para revisão.
- A primeira tela entregue é o cadastro de ferramentas (T-003), já ligada ao Supabase.
- O preset do projeto `wefinance` no Vercel muda de "Other" para "Next.js", o que é automático no primeiro deploy.
- Nenhuma dependência de provedor de IA ou de LLM entra no projeto.

## Decisão do PO

- [x] Aprovado em 09/11/2026: "pode fazer em next".

## Versões no scaffold

Next.js 16.4.5 (App Router, Turbopack, Cache Components ativo), React 19.3, TypeScript 5, Tailwind CSS 4, `@supabase/ssr` 0.12, Vitest 5, Supabase CLI 3.

Diferenças do Next.js 16 que afetam o código:

- O antigo `middleware.ts` agora é `src/proxy.ts`, com a função exportada `proxy`.
- Com Cache Components, ler cookies ou a sessão exige um `<Suspense>` em volta do componente.
- A documentação da versão instalada fica em `node_modules/next/dist/docs/` e prevalece sobre exemplos antigos (ver `AGENTS.md`).

O shadcn/ui e o Playwright entram na T-003, quando houver telas e fluxos para usar.
