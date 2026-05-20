/**
 * Tipos do schema Postgres. Em projeto real, gere automaticamente com:
 *   npx supabase gen types typescript --project-id <id> --schema public
 * Aqui mantemos uma definicao manual minima para o app funcionar.
 */
export type UserRole = "admin" | "recruiter" | "client";

export type ProjectStatus =
  | "planejado" | "em_andamento" | "atrasado" | "pausado" | "concluido" | "cancelado";

export type JobStatus =
  | "aberto" | "em_andamento" | "pausado" | "concluido" | "cancelado";

export type CandidateStage =
  | "triagem" | "entrevista_rh" | "entrevista_gestor"
  | "teste_tecnico" | "proposta" | "contratado" | "reprovado";

export type CandidateStatus = "em_andamento" | "aprovado" | "reprovado" | "standby";

export type CompanyStatus = "active" | "inactive";

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company_id: string | null;
  assigned_projects: string[];
  assigned_jobs: string[];
  assigned_services: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  nome: string;
  status: CompanyStatus;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  company_id: string;
  nome: string;
  tipo_servico: string;
  status: ProjectStatus;
  progresso: number;
  prazo_data: string | null;
  last_update: string;
  assigned_recruiter_id: string | null;
  visible_to_client: boolean;
  tem_recrutamento: boolean;
  descricao: string;
  anexos: { name: string; path: string }[];
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  project_id: string;
  recruiter_id: string | null;
  title: string;
  status: JobStatus;
  visible_to_client: boolean;
  created_at: string;
  updated_at: string;
}

export interface Candidate {
  id: string;
  job_id: string;
  name: string;
  stage: CandidateStage;
  score: number;
  notes: string;
  status: CandidateStatus;
  created_at: string;
  updated_at: string;
}

export interface ServiceContracted {
  id: string;
  company_id: string;
  service_name: string;
  active: boolean;
  visible_modules: string[];
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Para tipagem dos clients Supabase
export type Database = {
  public: {
    Tables: {
      profiles:            { Row: Profile;          Insert: Partial<Profile> & { id: string; name: string; email: string }; Update: Partial<Profile>; Relationships: [] };
      companies:           { Row: Company;          Insert: Partial<Company> & { nome: string }; Update: Partial<Company>; Relationships: [] };
      projects:            { Row: Project;          Insert: Partial<Project> & { company_id: string; nome: string; tipo_servico: string }; Update: Partial<Project>; Relationships: [] };
      jobs:                { Row: Job;              Insert: Partial<Job> & { project_id: string; title: string }; Update: Partial<Job>; Relationships: [] };
      candidates:          { Row: Candidate;        Insert: Partial<Candidate> & { job_id: string; name: string }; Update: Partial<Candidate>; Relationships: [] };
      services_contracted: { Row: ServiceContracted; Insert: Partial<ServiceContracted> & { company_id: string; service_name: string }; Update: Partial<ServiceContracted>; Relationships: [] };
      audit_logs:          { Row: AuditLog;         Insert: Partial<AuditLog> & { action: string; entity_type: string }; Update: Partial<AuditLog>; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Enums: {
      user_role: UserRole;
      project_status: ProjectStatus;
      job_status: JobStatus;
      candidate_stage: CandidateStage;
      candidate_status: CandidateStatus;
      company_status: CompanyStatus;
    };
  };
};
