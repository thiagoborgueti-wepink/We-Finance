# We-Finance: memória do projeto

Central de assinaturas da WePink: controla as ferramentas pagas pelos times, quanto custam, quando vencem, quem responde por cada conta e a qual centro de custo pertencem. Contexto completo em [readme.md](readme.md) e [docs/ROADMAP.md](docs/ROADMAP.md).

## Como construímos: AI-first

O We-Finance é construído pelo Claude, não por um time de desenvolvimento.

- **Claude** implementa de ponta a ponta: escolhe e propõe a arquitetura, escreve o código, as migrações do banco, os testes e a documentação, abre os commits e mantém o quadro de tarefas atualizado.
- **Thiago Borgueti (PO)** define escopo e prioridade, aprova decisões de arquitetura (ADRs), revisa o resultado no preview do Vercel e aprova o que vai para produção.
- **Financeiro** é o usuário principal e valida se o produto resolve o problema.

Na prática, isso significa:

- Claude não espera um dev para decidir: propõe com recomendação clara e segue após o OK do PO.
- Toda decisão técnica relevante vira um ADR em `docs/decisoes/`.
- O código precisa ser legível e documentado o suficiente para o Claude retomar o trabalho em uma sessão nova, sem depender de memória da conversa.

**AI-first é a forma de construir, não uma funcionalidade.** O produto **não tem recursos de IA**: nenhuma chamada a LLM ou provedor de IA no código. Leitura de faturas, importação e conciliação usam regras e parsers determinísticos.

## Stack

| Camada | Escolha | Status |
|---|---|---|
| Banco, autenticação e arquivos | Supabase (Postgres, Auth, Storage) | Decidido |
| Hospedagem | Vercel, projeto `wefinance` (time `thiagoborgueti-wepinks-projects`) | Decidido |
| Framework | Next.js 16 + TypeScript ([ADR-002](docs/decisoes/ADR-002-framework.md)) | Decidido |

- Repositório: https://github.com/thiagoborgueti-wepink/We-Finance, conectado ao Vercel (deploy da `main`, preview por pull request).
- Banco: projeto Supabase `foxvdhtmbjgqulzlnjag` ("We-Finance", us-west-2). **Não usar a integração do Supabase do Marketplace do Vercel**: ela cria um projeto novo e separado (foi o que aconteceu com `rmrjnxldbktmgcpffyfm`, desconectado em 12/11/2026).
- Variáveis no Vercel cadastradas à mão (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, em Production, Preview e Development). Localmente: `vercel env pull .env.local`. Nomes em [.env.example](.env.example).
- Detalhes em [docs/decisoes/ADR-001-stack.md](docs/decisoes/ADR-001-stack.md).

## Código

- **Next.js 16 tem mudanças que não estão no seu treino.** Antes de escrever código do Next, leia o guia correspondente em `node_modules/next/dist/docs/` (ver [AGENTS.md](AGENTS.md)). Exemplos: `middleware.ts` virou `src/proxy.ts`; com Cache Components, ler cookies ou sessão exige `<Suspense>`.
- Estrutura: telas em `src/app/`, regras de negócio puras em `src/lib/<domínio>/` com teste ao lado (`*.test.ts`), clientes do Supabase em `src/lib/supabase/` (`server.ts` para servidor, `client.ts` para navegador).
- Antes de commitar código, rode e deixe passando:

```
npm run lint
npm run typecheck
npm test
npm run build
```

- Nova migração do banco: `npm run db:migration -- <nome>`, que cria o arquivo em `supabase/migrations/`.
- No Windows, ao gravar arquivos pelo PowerShell 5.1, use UTF-8 **sem BOM**; o BOM quebra `config.toml` e JSON.

## Regras do projeto

- **Tarefas em Markdown, não no GitHub Projects.** Cada tarefa é um arquivo em `docs/tasks/`. Ao mudar o status, atualize o arquivo e mova a linha em `docs/BOARD.md` no mesmo commit. Tarefa nova: copie `docs/tasks/_TEMPLATE.md`.
- **Fluxo de código:** uma branch por tarefa (`t-XXX-slug`), pull request para a `main`, PO revisa o preview do Vercel e aprova o merge. Mudanças só de documentação podem ir direto na `main`.
- **Commits** em português, no formato `tipo: descrição` (feat, fix, docs, chore, refactor, test).
- **Segredos nunca no git.** `.env` e `.env.*` estão no `.gitignore`. A chave `service_role` só no servidor.
- **Banco:** migrações versionadas em `supabase/migrations/`; RLS habilitado em todas as tabelas desde a primeira migração.
- **Dados sensíveis:** nunca armazenar número de cartão ou dado bancário.
- **Login:** o produto terá SSO com Microsoft (Entra ID) num segundo momento (T-025). Desde já, perfis e permissões ficam ligados ao usuário do Supabase e ao e-mail, nunca ao provedor de login, para aceitar vários provedores sem migração.
- **Open source no futuro (Fase 4):** não colocar dados reais da WePink (valores, contas, e-mails) em código, seeds ou testes. Use dados fictícios.
- **Referências** (Wallos, Renewlet, Firefly III, Snipe-IT) servem só de inspiração. Não copiar código delas.
- **Idioma:** interface e documentação em português do Brasil.

## Estado atual

Ver [docs/BOARD.md](docs/BOARD.md). Existe um protótipo publicado como artifact no Claude, com 11 ferramentas reais do centro APP; ele será substituído pela aplicação (T-009).
