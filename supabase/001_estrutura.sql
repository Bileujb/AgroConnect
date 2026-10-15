-- Execute no SQL Editor do projeto Supabase. Não apaga as tabelas existentes.
-- O schema privado separa esta API Java da Data API pública do Supabase.
begin;
create schema if not exists agroconnect;

create table if not exists agroconnect.usuarios (
  id uuid primary key references auth.users(id),
  nome varchar(120) not null,
  email varchar(254) not null,
  tipo_usuario varchar(20) not null check (tipo_usuario in ('produtor','consumidor')),
  cidade varchar(80) not null default '',
  nome_fazenda varchar(120) not null default '',
  cnpj varchar(30) not null default '',
  endereco_fazenda varchar(300) not null default '',
  endereco_entrega varchar(300) not null default '',
  created_at timestamptz not null default now()
);
create table if not exists agroconnect.produtos (
  id uuid primary key,
  produtor_id uuid not null references agroconnect.usuarios(id),
  nome varchar(120) not null,
  descricao varchar(2000) not null default '',
  preco numeric(12,2) not null check (preco > 0),
  categoria varchar(30) not null check (categoria in ('Verduras','Legumes','Frutas','Derivados')),
  quantidade_estoque integer not null check (quantidade_estoque >= 0),
  imagem varchar(2048),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists agroconnect.checkouts (
  id uuid primary key,
  consumidor_id uuid not null references agroconnect.usuarios(id),
  chave varchar(100) not null,
  assinatura varchar(64) not null,
  created_at timestamptz not null default now(),
  unique (consumidor_id,chave)
);
create table if not exists agroconnect.pedidos (
  id uuid primary key,
  checkout_id uuid not null references agroconnect.checkouts(id),
  consumidor_id uuid not null references agroconnect.usuarios(id),
  produtor_id uuid not null references agroconnect.usuarios(id),
  status varchar(20) not null default 'aguardando'
    check (status in ('aguardando','confirmado','em_rota','entregue','cancelado')),
  valor_total numeric(12,2) not null check (valor_total > 0),
  endereco_entrega varchar(300) not null,
  cidade_entrega varchar(80) not null,
  created_at timestamptz not null default now(),
  unique (checkout_id,produtor_id)
);
create table if not exists agroconnect.itens_pedido (
  id uuid primary key,
  pedido_id uuid not null references agroconnect.pedidos(id),
  produto_id uuid not null references agroconnect.produtos(id),
  nome varchar(120) not null,
  quantidade integer not null check (quantidade > 0),
  preco_unitario numeric(12,2) not null check (preco_unitario > 0),
  unique (pedido_id,produto_id)
);
create table if not exists agroconnect.avaliacoes (
  id uuid primary key,
  pedido_id uuid not null unique references agroconnect.pedidos(id),
  consumidor_id uuid not null references agroconnect.usuarios(id),
  produtor_id uuid not null references agroconnect.usuarios(id),
  nota integer not null check (nota between 1 and 5),
  comentario varchar(1000) not null default '',
  created_at timestamptz not null default now()
);
create index if not exists produtos_produtor_idx on agroconnect.produtos(produtor_id);
create index if not exists pedidos_consumidor_idx on agroconnect.pedidos(consumidor_id,created_at desc);
create index if not exists pedidos_produtor_idx on agroconnect.pedidos(produtor_id,created_at desc);
create index if not exists itens_pedido_idx on agroconnect.itens_pedido(pedido_id);
create index if not exists itens_produto_idx on agroconnect.itens_pedido(produto_id);
create index if not exists avaliacoes_produtor_idx on agroconnect.avaliacoes(produtor_id);
create index if not exists avaliacoes_consumidor_idx on agroconnect.avaliacoes(consumidor_id);

-- Sem políticas de acesso direto: todo acesso do app passa pela API Java.
-- A conexão do backend deve usar o usuário postgres do painel Connect (servidor).
alter table agroconnect.usuarios enable row level security;
alter table agroconnect.produtos enable row level security;
alter table agroconnect.checkouts enable row level security;
alter table agroconnect.pedidos enable row level security;
alter table agroconnect.itens_pedido enable row level security;
alter table agroconnect.avaliacoes enable row level security;
revoke all on schema agroconnect from public, anon, authenticated;
revoke all on all tables in schema agroconnect from public, anon, authenticated;
commit;
