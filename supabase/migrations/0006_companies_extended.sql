-- =====================================================================
-- Estende a tabela companies com campos corporativos brasileiros.
-- Todos opcionais (nullable) para nao quebrar registros existentes.
-- =====================================================================

alter table public.companies add column if not exists nome_fantasia        text;
alter table public.companies add column if not exists cnpj                 text;
alter table public.companies add column if not exists inscricao_estadual   text;
alter table public.companies add column if not exists inscricao_municipal  text;
alter table public.companies add column if not exists email                text;
alter table public.companies add column if not exists telefone             text;
alter table public.companies add column if not exists endereco_logradouro  text;
alter table public.companies add column if not exists endereco_numero      text;
alter table public.companies add column if not exists endereco_complemento text;
alter table public.companies add column if not exists endereco_bairro      text;
alter table public.companies add column if not exists endereco_cidade      text;
alter table public.companies add column if not exists endereco_uf          text;
alter table public.companies add column if not exists endereco_cep         text;
alter table public.companies add column if not exists responsavel_nome     text;
alter table public.companies add column if not exists responsavel_cargo    text;
alter table public.companies add column if not exists observacoes          text;

-- CNPJ unico quando preenchido (permite multiplos NULLs)
create unique index if not exists companies_cnpj_unique
  on public.companies (cnpj)
  where cnpj is not null;
