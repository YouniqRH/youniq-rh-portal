-- =====================================================================
-- Seed Youniq RH - dados de demonstracao
-- ATENCAO: cria usuarios em auth.users diretamente (nao recomendado
-- em producao). Use somente para popular ambiente DEV/STAGING.
-- Em producao, crie o primeiro admin via /admin Supabase Studio ou
-- via API server-side e use o painel /admin para os demais.
-- =====================================================================

-- ---------------- Companies ----------------
insert into public.companies (id, nome) values
  ('11111111-1111-1111-1111-111111111111', 'Alpha Tecnologia S/A'),
  ('22222222-2222-2222-2222-222222222222', 'Beta Consultoria Ltda'),
  ('33333333-3333-3333-3333-333333333333', 'Youniq RH')
on conflict (id) do nothing;

-- ---------------- Usuarios em auth.users ----------------
-- Senhas (texto plano antes do bcrypt - Supabase faz o hash via API)
-- admin@youniq.com.br / admin
-- recrutadora@youniq.com.br / recrutar123
-- cliente1@youniq.com.br / 123
-- cliente2@empresa.com.br / abc

-- Usa funcao auth.create_user (privada) atraves de insert direto + hash bcrypt manual.
-- Em geral nao funciona com inserts SQL puros do Supabase Studio.
-- POR ISSO: o seed real de usuarios vai pelo script Node 'scripts/seed-users.ts'.
-- Aqui populamos somente as tabelas de dominio com IDs fixos que esse script ira reutilizar.

-- IDs fixos para profiles - vinculados aos usuarios criados pelo seed-users.ts
-- admin       : a0000000-0000-0000-0000-00000000000a
-- recrutadora : a0000000-0000-0000-0000-0000000000re
-- cliente1    : a0000000-0000-0000-0000-000000000c01
-- cliente2    : a0000000-0000-0000-0000-000000000c02

-- ---------------- Projects ----------------
insert into public.projects
  (id, company_id, nome, tipo_servico, status, progresso, prazo_data, visible_to_client, tem_recrutamento, descricao)
values
  ('a0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'Recrutamento - Desenvolvedor Sr Backend', 'Recrutamento & Selecao', 'em_andamento', 65,
   current_date + 18, true, true,
   'Vaga estrategica de backend senior (Python/Go) para o time de plataforma.'),
  ('a0000001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'Programa de Onboarding 2026', 'Treinamentos', 'em_andamento', 40,
   current_date + 45, true, false, 'Implementacao da nova trilha de onboarding.'),
  ('a0000001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   'Auditoria de Folha Q1', 'Folha de Ponto', 'concluido', 100,
   current_date - 10, true, false, 'Revisao da folha do primeiro trimestre.'),
  ('a0000001-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
   'Recrutamento - Analista de Marketing Pleno', 'Recrutamento & Selecao', 'atrasado', 35,
   current_date - 3, true, true, 'Vaga para o time de growth.'),
  ('a0000001-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111',
   'Assessment Comportamental - Lideranca', 'Assessments', 'em_andamento', 72,
   current_date + 22, true, false, 'Aplicacao para todos os gestores.'),
  ('a0000002-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222',
   'Admissao Lote Maio - 14 colaboradores', 'Admissao & Demissao', 'em_andamento', 58,
   current_date + 9, true, false, 'Processamento documental do lote de maio.'),
  ('a0000002-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222',
   'Fechamento de Ponto - Abril', 'Folha de Ponto', 'concluido', 100,
   current_date - 15, true, false, 'Fechamento do ponto eletronico.'),
  ('a0000002-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222',
   'Atualizacao do Manual do Colaborador', 'Documentos', 'em_andamento', 28,
   current_date + 60, true, false, 'Revisao integral do manual.'),
  ('a0000002-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222',
   'Desligamentos Programados Q2', 'Admissao & Demissao', 'pausado', 20,
   current_date + 75, false, false, 'Desligamento programado.'),
  ('a0000002-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222',
   'Solicitacoes de Ferias - Maio', 'Solicitacoes', 'em_andamento', 85,
   current_date + 6, true, false, 'Processamento das solicitacoes.')
on conflict (id) do nothing;

-- ---------------- Services contracted ----------------
insert into public.services_contracted (company_id, service_name, active, visible_modules) values
  ('11111111-1111-1111-1111-111111111111', 'Recrutamento Completo', true,
   '{recrutamento,shortlist,candidatos,etapas,assessments,treinamentos,crm,empresas,contatos,interacoes,tarefas,calendario,suporte,historico,admissao,folha_ponto,documentos,solicitacoes}'),
  ('22222222-2222-2222-2222-222222222222', 'RH Administrativo', true,
   '{admissao,folha_ponto,documentos,solicitacoes,suporte,historico}')
on conflict do nothing;

-- ---------------- Jobs (vagas de recrutamento) ----------------
-- Job da vaga 'Backend Sr' do projeto a0000001-0000-0000-0000-000000000001
insert into public.jobs (id, project_id, title, status, visible_to_client) values
  ('b0000001-0000-0000-0000-000000000001',
   'a0000001-0000-0000-0000-000000000001',
   'Desenvolvedor Sr Backend - Python/Go', 'em_andamento', true),
  ('b0000001-0000-0000-0000-000000000002',
   'a0000001-0000-0000-0000-000000000004',
   'Analista de Marketing Pleno', 'em_andamento', true)
on conflict (id) do nothing;

-- ---------------- Candidates ----------------
insert into public.candidates (job_id, name, stage, score, status, notes) values
  ('b0000001-0000-0000-0000-000000000001', 'Marina Souza',      'triagem',           76, 'em_andamento', 'Boa experiencia com microservicos.'),
  ('b0000001-0000-0000-0000-000000000001', 'Rafael Lima',       'entrevista_rh',     88, 'em_andamento', 'Forte comunicacao, disponivel em 30 dias.'),
  ('b0000001-0000-0000-0000-000000000001', 'Beatriz Carvalho',  'entrevista_gestor', 92, 'em_andamento', 'Match alto com cultura.'),
  ('b0000001-0000-0000-0000-000000000001', 'Diego Almeida',     'teste_tecnico',     81, 'em_andamento', 'Aguardando entrega do desafio.'),
  ('b0000001-0000-0000-0000-000000000001', 'Camila Ribeiro',    'proposta',          95, 'em_andamento', 'Proposta enviada.'),
  ('b0000001-0000-0000-0000-000000000001', 'Lucas Pereira',     'triagem',           42, 'reprovado',    'Senioridade abaixo do esperado.'),
  ('b0000001-0000-0000-0000-000000000001', 'Helena Martins',    'entrevista_rh',     73, 'em_andamento', 'Perfil mais junior.'),
  ('b0000001-0000-0000-0000-000000000001', 'Felipe Oliveira',   'entrevista_gestor', 86, 'em_andamento', 'Boa entrega tecnica.'),
  ('b0000001-0000-0000-0000-000000000002', 'Tatiana Reis',      'triagem',           68, 'em_andamento', ''),
  ('b0000001-0000-0000-0000-000000000002', 'Vinicius Castro',   'entrevista_rh',     78, 'em_andamento', 'Veio por indicacao.'),
  ('b0000001-0000-0000-0000-000000000002', 'Patricia Gomes',    'entrevista_gestor', 83, 'em_andamento', 'Cases relevantes em SaaS B2B.');
