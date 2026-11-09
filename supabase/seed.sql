-- Dados FICTÍCIOS para desenvolvimento local (`supabase db reset`).
-- Nunca coloque aqui dados reais da empresa: o projeto será open source.

insert into public.dominios_permitidos (dominio) values ('example.com');

insert into public.centros_custo (id, nome, orcamento_mensal) values
  ('00000000-0000-4000-8000-000000000001', 'Produto', 5000.00),
  ('00000000-0000-4000-8000-000000000002', 'Marketing', null);

insert into public.ferramentas
  (nome, centro_custo_id, categoria_id, responsavel, valor, moeda, ciclo_meses, proxima_cobranca, forma_pagamento, situacao, observacoes)
values
  ('Hospedagem Exemplo', '00000000-0000-4000-8000-000000000001',
    (select id from public.categorias where nome = 'Infra e deploy'),
    'Financeiro', 20.00, 'USD', 1, current_date + 5, 'Cartão corporativo', 'ativa', 'Cobrança vencendo em breve'),
  ('Loja de Apps Exemplo', '00000000-0000-4000-8000-000000000001',
    (select id from public.categorias where nome = 'Lojas de app'),
    'Financeiro', 99.00, 'USD', 12, current_date + 200, 'Cartão corporativo', 'ativa', null),
  ('Certificado Exemplo', '00000000-0000-4000-8000-000000000001',
    (select id from public.categorias where nome = 'Infra e deploy'),
    null, 1500.00, 'BRL', 36, current_date + 900, 'Boleto', 'ativa', 'Ciclo de 3 anos'),
  ('Banco de Dados Exemplo', '00000000-0000-4000-8000-000000000001',
    (select id from public.categorias where nome = 'Infra e deploy'),
    'Financeiro', 300.00, 'USD', 1, current_date - 3, 'Cartão corporativo', 'ativa', 'Cobrança vencida'),
  ('Editor de Imagens Exemplo', '00000000-0000-4000-8000-000000000002',
    (select id from public.categorias where nome = 'Design'),
    'Financeiro', 150.00, 'BRL', 1, current_date + 20, 'Cartão corporativo', 'a_cancelar', null),
  ('Ferramenta Sem Centro', null,
    (select id from public.categorias where nome = 'Outros'),
    null, 0, 'BRL', 1, null, null, 'pausada', 'Plano gratuito');
