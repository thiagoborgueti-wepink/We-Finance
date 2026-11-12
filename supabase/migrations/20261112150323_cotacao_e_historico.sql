-- Cotação do dólar (T-011) e histórico de alterações das ferramentas (T-012).
-- Mesmas regras da migração inicial: RLS em tudo, acesso por public.usuario_autorizado().

-- ---------------------------------------------------------------------------
-- Cotações USD -> BRL
-- ---------------------------------------------------------------------------
-- Cada linha é uma cotação registrada: a PTAX buscada no Banco Central uma vez
-- por dia, ou um valor digitado à mão. A cotação em uso é sempre a registrada
-- por último. Linhas não são editadas nem apagadas: viram o histórico da cotação.

create table public.cotacoes (
  id bigint generated always as identity primary key,
  valor numeric(10, 4) not null check (valor > 0 and valor < 100),
  data_referencia date not null,
  fonte text not null check (fonte in ('ptax', 'manual')),
  registrada_em timestamptz not null default now(),
  registrada_por uuid default auth.uid() references auth.users (id) on delete set null
);

comment on table public.cotacoes is
  'Cotações USD->BRL registradas (PTAX do Banco Central ou manual). Vale a mais recente.';

create index cotacoes_registrada_em_idx on public.cotacoes (registrada_em desc);

alter table public.cotacoes enable row level security;

create policy "autorizados leem cotacoes"
  on public.cotacoes for select to authenticated
  using ((select public.usuario_autorizado()));

create policy "autorizados registram cotacoes"
  on public.cotacoes for insert to authenticated
  with check ((select public.usuario_autorizado()));

-- ---------------------------------------------------------------------------
-- Histórico de alterações das ferramentas
-- ---------------------------------------------------------------------------
-- Preenchido só pelo gatilho abaixo. Não há política de insert, update ou
-- delete: pela API ninguém altera o histórico. Sem chave estrangeira para
-- ferramentas, para o registro sobreviver à exclusão.

create table public.historico_ferramentas (
  id bigint generated always as identity primary key,
  ferramenta_id uuid not null,
  ferramenta_nome text not null,
  acao text not null check (acao in ('criacao', 'edicao', 'exclusao')),
  campo text,
  valor_anterior text,
  valor_novo text,
  origem text not null default 'interface' check (origem in ('interface', 'importacao')),
  usuario_id uuid,
  usuario_email text,
  registrado_em timestamptz not null default now()
);

comment on table public.historico_ferramentas is
  'Auditoria de criação, edição (um registro por campo) e exclusão de ferramentas. Somente leitura pela API.';

create index historico_ferramentas_ferramenta_idx
  on public.historico_ferramentas (ferramenta_id, registrado_em desc);

alter table public.historico_ferramentas enable row level security;

create policy "autorizados leem historico"
  on public.historico_ferramentas for select to authenticated
  using ((select public.usuario_autorizado()));

-- Texto legível de um campo: nomes no lugar dos ids de centro e categoria.
create function public.valor_legivel_ferramenta(campo text, valor jsonb)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when valor is null or valor = 'null'::jsonb then null
    when campo = 'centro_custo_id' then
      (select c.nome from public.centros_custo c where c.id = (valor #>> '{}')::uuid)
    when campo = 'categoria_id' then
      (select c.nome from public.categorias c where c.id = (valor #>> '{}')::smallint)
    else valor #>> '{}'
  end;
$$;

create function public.registrar_historico_ferramenta()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_origem text;
  v_email text := auth.jwt() ->> 'email';
  v_antigo jsonb;
  v_novo jsonb;
  v_campo text;
begin
  -- A aplicação marca importações com o cabeçalho x-wefinance-origem.
  begin
    v_origem := current_setting('request.headers', true)::json ->> 'x-wefinance-origem';
  exception when others then
    v_origem := null;
  end;
  if v_origem is distinct from 'importacao' then
    v_origem := 'interface';
  end if;

  if tg_op = 'INSERT' then
    insert into public.historico_ferramentas
      (ferramenta_id, ferramenta_nome, acao, origem, usuario_id, usuario_email)
    values (new.id, new.nome, 'criacao', v_origem, auth.uid(), v_email);
    return new;
  end if;

  if tg_op = 'DELETE' then
    insert into public.historico_ferramentas
      (ferramenta_id, ferramenta_nome, acao, origem, usuario_id, usuario_email)
    values (old.id, old.nome, 'exclusao', v_origem, auth.uid(), v_email);
    return old;
  end if;

  v_antigo := to_jsonb(old) - array['id', 'criado_em', 'atualizado_em', 'criado_por'];
  v_novo := to_jsonb(new) - array['id', 'criado_em', 'atualizado_em', 'criado_por'];

  for v_campo in select jsonb_object_keys(v_novo) loop
    if v_antigo -> v_campo is distinct from v_novo -> v_campo then
      insert into public.historico_ferramentas
        (ferramenta_id, ferramenta_nome, acao, campo, valor_anterior, valor_novo,
         origem, usuario_id, usuario_email)
      values (
        new.id, new.nome, 'edicao', v_campo,
        public.valor_legivel_ferramenta(v_campo, v_antigo -> v_campo),
        public.valor_legivel_ferramenta(v_campo, v_novo -> v_campo),
        v_origem, auth.uid(), v_email
      );
    end if;
  end loop;

  return new;
end;
$$;

create trigger ferramentas_historico
  after insert or update or delete on public.ferramentas
  for each row execute function public.registrar_historico_ferramenta();

-- Funções internas não precisam ser chamadas pela API.
revoke execute on function public.registrar_historico_ferramenta() from public, anon, authenticated;
revoke execute on function public.valor_legivel_ferramenta(text, jsonb) from public, anon, authenticated;
