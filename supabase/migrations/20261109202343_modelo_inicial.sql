-- T-002: modelo inicial do We-Finance
-- Ferramentas (assinaturas), centros de custo e categorias.
-- Documentação: docs/MODELO-DE-DADOS.md

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------

create type public.moeda as enum ('BRL', 'USD');

create type public.situacao_ferramenta as enum ('ativa', 'a_cancelar', 'pausada');

-- ---------------------------------------------------------------------------
-- Controle de acesso por domínio de e-mail
-- ---------------------------------------------------------------------------
-- Só usuários com e-mail de um domínio listado aqui acessam os dados.
-- A tabela fica vazia na migração (o projeto será open source): o domínio da
-- empresa é cadastrado direto no banco de cada ambiente. Sem cadastro, ninguém
-- acessa (falha fechada).

create table public.dominios_permitidos (
  dominio text primary key check (dominio = lower(dominio) and dominio ~ '^[a-z0-9.-]+\.[a-z]{2,}$'),
  criado_em timestamptz not null default now()
);

alter table public.dominios_permitidos enable row level security;
-- Sem políticas: só o SQL Editor e a service role leem ou alteram esta tabela.

create function public.usuario_autorizado()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.dominios_permitidos d
    where d.dominio = lower(split_part(auth.jwt() ->> 'email', '@', 2))
  );
$$;

comment on function public.usuario_autorizado() is
  'Verdadeiro quando o e-mail do usuário logado pertence a um domínio de public.dominios_permitidos. Base das políticas de RLS até os perfis da T-020.';

-- ---------------------------------------------------------------------------
-- Função de apoio: atualizado_em automático
-- ---------------------------------------------------------------------------

create function public.definir_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Centros de custo
-- ---------------------------------------------------------------------------

create table public.centros_custo (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(btrim(nome)) between 1 and 60),
  -- Orçamento mensal em reais (T-010). Nulo = sem orçamento definido.
  orcamento_mensal numeric(12, 2) check (orcamento_mensal >= 0),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create unique index centros_custo_nome_unico on public.centros_custo (lower(btrim(nome)));

create trigger centros_custo_atualizado_em
  before update on public.centros_custo
  for each row execute function public.definir_atualizado_em();

-- ---------------------------------------------------------------------------
-- Categorias (dados de referência, mantidos por migração)
-- ---------------------------------------------------------------------------

create table public.categorias (
  id smallint generated always as identity primary key,
  nome text not null unique,
  ordem smallint not null default 0
);

insert into public.categorias (nome, ordem) values
  ('Infra e deploy', 1),
  ('Lojas de app', 2),
  ('Produtividade', 3),
  ('Analytics', 4),
  ('Design', 5),
  ('IA', 6),
  ('Outros', 99);

-- ---------------------------------------------------------------------------
-- Ferramentas
-- ---------------------------------------------------------------------------

create table public.ferramentas (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(btrim(nome)) between 1 and 120),
  centro_custo_id uuid references public.centros_custo (id) on delete restrict,
  categoria_id smallint not null references public.categorias (id),
  responsavel text check (char_length(responsavel) <= 120),
  conta_login text check (char_length(conta_login) <= 200),

  valor numeric(12, 2) not null default 0 check (valor >= 0),
  moeda public.moeda not null default 'BRL',
  -- Periodicidade da cobrança em meses: 1 mensal, 12 anual, 36 para um
  -- certificado de 3 anos. Custo mensal = valor / ciclo_meses.
  ciclo_meses smallint not null default 1 check (ciclo_meses between 1 and 60),
  proxima_cobranca date,

  -- Descrição da forma de pagamento (ex.: "Cartão corporativo", "Boleto").
  -- Nunca o número do cartão: sequências longas de dígitos são recusadas.
  forma_pagamento text check (
    char_length(forma_pagamento) <= 120
    and forma_pagamento !~ '[0-9][0-9 .-]{11,}[0-9]'
  ),
  situacao public.situacao_ferramenta not null default 'ativa',
  observacoes text check (
    char_length(observacoes) <= 2000
    and observacoes !~ '[0-9][0-9 .-]{11,}[0-9]'
  ),

  criado_por uuid default auth.uid() references auth.users (id) on delete set null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

comment on column public.ferramentas.centro_custo_id is
  'Nulo = "Sem centro de custo".';

-- Mesma ferramenta não se repete no mesmo centro (chave da importação, T-007).
create unique index ferramentas_nome_centro_unico
  on public.ferramentas (centro_custo_id, lower(btrim(nome))) nulls not distinct;

create index ferramentas_proxima_cobranca on public.ferramentas (proxima_cobranca);
create index ferramentas_categoria on public.ferramentas (categoria_id);

create trigger ferramentas_atualizado_em
  before update on public.ferramentas
  for each row execute function public.definir_atualizado_em();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- Até a T-020 (perfis), todo usuário autorizado pelo domínio lê e edita.
-- Visitantes sem login (anon) não acessam nada.

alter table public.centros_custo enable row level security;
alter table public.categorias enable row level security;
alter table public.ferramentas enable row level security;

create policy "autorizados leem centros"
  on public.centros_custo for select to authenticated
  using ((select public.usuario_autorizado()));

create policy "autorizados criam centros"
  on public.centros_custo for insert to authenticated
  with check ((select public.usuario_autorizado()));

create policy "autorizados alteram centros"
  on public.centros_custo for update to authenticated
  using ((select public.usuario_autorizado()))
  with check ((select public.usuario_autorizado()));

create policy "autorizados excluem centros"
  on public.centros_custo for delete to authenticated
  using ((select public.usuario_autorizado()));

create policy "autorizados leem categorias"
  on public.categorias for select to authenticated
  using ((select public.usuario_autorizado()));

create policy "autorizados leem ferramentas"
  on public.ferramentas for select to authenticated
  using ((select public.usuario_autorizado()));

create policy "autorizados criam ferramentas"
  on public.ferramentas for insert to authenticated
  with check ((select public.usuario_autorizado()));

create policy "autorizados alteram ferramentas"
  on public.ferramentas for update to authenticated
  using ((select public.usuario_autorizado()))
  with check ((select public.usuario_autorizado()));

create policy "autorizados excluem ferramentas"
  on public.ferramentas for delete to authenticated
  using ((select public.usuario_autorizado()));
