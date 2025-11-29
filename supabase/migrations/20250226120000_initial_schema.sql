/*
  # Configuração Inicial do Banco de Dados Financeiro
  
  ## Descrição da Query:
  1. Criação das tabelas principais: profiles, transactions, goals.
  2. Configuração de Segurança (RLS) para garantir que usuários só vejam seus próprios dados.
  3. Automação (Trigger) para criar perfil público quando um usuário se cadastra.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "High"
  - Requires-Backup: false
  - Reversible: true
  
  ## Detalhes da Estrutura:
  - public.profiles: Dados do usuário (nome, avatar).
  - public.transactions: Gastos e Ganhos.
  - public.goals: Caixinhas/Metas financeiras.
*/

-- 1. Tabela de Perfis (Ligada ao Auth do Supabase)
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone,
  primary key (id)
);

alter table public.profiles enable row level security;

create policy "Usuários podem ver seus próprios perfis"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Usuários podem atualizar seus próprios perfis"
  on public.profiles for update
  using ( auth.uid() = id );

-- 2. Tabela de Transações (Gastos e Ganhos)
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null,
  type text check (type in ('expense', 'income')) not null,
  category text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions enable row level security;

create policy "Usuários podem ver suas transações"
  on public.transactions for select
  using ( auth.uid() = user_id );

create policy "Usuários podem criar transações"
  on public.transactions for insert
  with check ( auth.uid() = user_id );

create policy "Usuários podem deletar suas transações"
  on public.transactions for delete
  using ( auth.uid() = user_id );

-- 3. Tabela de Caixinhas (Goals)
create table public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  target_amount numeric,
  current_amount numeric default 0,
  icon text,
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.goals enable row level security;

create policy "Usuários podem ver suas caixinhas"
  on public.goals for select
  using ( auth.uid() = user_id );

create policy "Usuários podem criar caixinhas"
  on public.goals for insert
  with check ( auth.uid() = user_id );

create policy "Usuários podem atualizar suas caixinhas"
  on public.goals for update
  using ( auth.uid() = user_id );

-- 4. Trigger para criar perfil automaticamente no cadastro
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

-- Remove trigger se existir para evitar duplicidade em migrações manuais
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
