# Modelo de dados

Banco: Postgres no Supabase. Migrações em [`supabase/migrations/`](../supabase/migrations/). Tarefa de origem: [T-002](tasks/T-002-modelo-de-dados.md).

## Tabelas

### `ferramentas`

Cada assinatura ou serviço pago.

| Coluna | Tipo | Regra |
|---|---|---|
| `id` | uuid | Chave |
| `nome` | text | Obrigatório, até 120 caracteres |
| `centro_custo_id` | uuid → `centros_custo` | Nulo = "Sem centro de custo" |
| `categoria_id` | smallint → `categorias` | Obrigatório |
| `responsavel` | text | Quem responde pela conta |
| `conta_login` | text | E-mail ou usuário de acesso |
| `valor` | numeric(12,2) | Valor de **um ciclo**, ≥ 0 |
| `moeda` | `BRL` ou `USD` | |
| `ciclo_meses` | smallint | 1 mensal, 12 anual, 36 para 3 anos (1 a 60) |
| `proxima_cobranca` | date | Base dos alertas |
| `forma_pagamento` | text | Texto livre; **números de cartão são recusados** |
| `situacao` | `ativa`, `a_cancelar`, `pausada` | |
| `observacoes` | text | Até 2000 caracteres; números de cartão recusados |
| `criado_por` | uuid → `auth.users` | Preenchido automaticamente |
| `criado_em`, `atualizado_em` | timestamptz | `atualizado_em` por trigger |

Uma ferramenta não se repete no mesmo centro: o índice único é `(centro_custo_id, nome sem diferença de maiúsculas)`. É a chave usada na importação de CSV (T-007).

**Custo mensal em R$** = `valor` convertido para reais ÷ `ciclo_meses` (regra em `src/lib/custos/custo.ts`).

### `centros_custo`

| Coluna | Tipo | Regra |
|---|---|---|
| `id` | uuid | Chave |
| `nome` | text | Único, sem diferença de maiúsculas |
| `orcamento_mensal` | numeric(12,2) | Opcional (T-010) |

Um centro com ferramentas não pode ser excluído (`on delete restrict`).

### `categorias`

Dados de referência criados pela migração: Infra e deploy, Lojas de app, Produtividade, Analytics, Design, IA, Outros. Só leitura pelo app.

### `dominios_permitidos`

Domínios de e-mail que podem acessar os dados. **Fica vazia na migração**, porque o projeto será open source; o domínio da empresa é cadastrado direto no banco de cada ambiente. Sem nenhum domínio, ninguém acessa (falha fechada).

### `cotacoes` (T-011)

Cotações USD → BRL registradas: `valor`, `data_referencia` (data do boletim), `fonte` (`ptax` ou `manual`), `registrada_em`, `registrada_por`. Vale a registrada por último.

- Uma vez por dia (horário de São Paulo), ao abrir o painel, a aplicação busca a PTAX de venda no Banco Central (API pública, sem chave) e registra.
- Uma cotação manual vale até a próxima busca diária.
- Se o BCB falhar, usa a última salva e avisa a data. Sem nenhuma salva, usa R$ 5,50 provisório com aviso.
- Pode ler e inserir; não pode alterar nem apagar (as linhas são o histórico da cotação).

### `historico_ferramentas` (T-012)

Auditoria preenchida só pelo gatilho `ferramentas_historico`: criação, exclusão e uma linha por campo alterado na edição, com valor anterior e novo em texto (centro e categoria pelo nome), e-mail de quem fez e `origem` (`interface` ou `importacao`).

- A importação marca a origem com o cabeçalho HTTP `x-wefinance-origem: importacao`, que o gatilho lê de `request.headers`.
- Sem chave estrangeira para `ferramentas`: o histórico sobrevive à exclusão.
- Pela API só há leitura. Não há política de insert, update nem delete.

## Segurança (RLS)

RLS está ativo em todas as tabelas.

- Visitante sem login (`anon`): não acessa nada.
- Usuário logado (`authenticated`): acessa só se `public.usuario_autorizado()` for verdadeiro, ou seja, se o domínio do seu e-mail estiver em `dominios_permitidos`.
- Até a T-020 (perfis), todo usuário autorizado lê e edita ferramentas e centros. A T-020 troca isso por permissões por perfil (Financeiro, Gestor de centro, Leitura).
- `categorias`: só leitura. `dominios_permitidos`: nenhum acesso pelo app.

O controle por domínio existe porque o Supabase permite, por padrão, que qualquer pessoa crie uma conta. Sem ele, "qualquer usuário logado" seria qualquer pessoa.

## Passo manual em cada ambiente

Depois de aplicar a migração num banco novo, cadastre o domínio da empresa no SQL Editor do Supabase:

```sql
insert into public.dominios_permitidos (dominio) values ('<dominio-da-empresa>');
```

## Desenvolvimento local

`supabase start` sobe o banco local (requer Docker) e `supabase db reset` aplica as migrações e o [`seed.sql`](../supabase/seed.sql), que tem apenas dados fictícios e libera o domínio `example.com`.
