/**
 * Configuracao da sidebar.
 * Cada item tem 'roles' (quem pode ver) e opcionalmente 'module'
 * (chave do servico contratado - se presente, so aparece se o cliente tiver contratado).
 */
import {
  LayoutGrid, Briefcase, Zap, Users, GitBranch, UserPlus, Clock,
  BookOpen, ClipboardList, FileText, Inbox, Layers, Building, IdCard,
  MessageSquare, CheckSquare, CalendarDays, LifeBuoy, RotateCcw, ShieldCheck,
  Network,
} from "lucide-react";
import type { UserRole } from "@/types/database";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: string;
  roles: UserRole[];
  /** Se definido e o role for 'client', so aparece quando esta em visible_modules. */
  module?: string;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard",  label: "Dashboard",                  icon: LayoutGrid, group: "Principal",          roles: ["admin", "recruiter", "client"] },

  { href: "/projetos",   label: "Projetos de Recrutamento",   icon: Briefcase,  group: "Recrutamento",       roles: ["admin", "recruiter", "client"], module: "recrutamento" },
  { href: "/shortlist",  label: "Shortlist ao Vivo",          icon: Zap,        group: "Recrutamento",       roles: ["admin", "recruiter", "client"], module: "shortlist" },
  { href: "/candidatos", label: "Candidatos",                 icon: Users,      group: "Recrutamento",       roles: ["admin", "recruiter"],            module: "candidatos" },
  { href: "/modulo/etapas", label: "Etapas do Processo",      icon: GitBranch,  group: "Recrutamento",       roles: ["admin", "recruiter", "client"], module: "etapas" },

  { href: "/modulo/admissao",     label: "Admissao & Demissao", icon: UserPlus,     group: "RH Administrativo", roles: ["admin", "client"], module: "admissao" },
  { href: "/modulo/folha-ponto",  label: "Folha de Ponto",      icon: Clock,        group: "RH Administrativo", roles: ["admin", "client"], module: "folha_ponto" },
  { href: "/modulo/treinamentos", label: "Treinamentos",        icon: BookOpen,     group: "RH Administrativo", roles: ["admin", "client"], module: "treinamentos" },
  { href: "/modulo/assessments",  label: "Assessments",         icon: ClipboardList, group: "RH Administrativo", roles: ["admin", "client"], module: "assessments" },
  { href: "/modulo/documentos",   label: "Documentos",          icon: FileText,     group: "RH Administrativo", roles: ["admin", "client"], module: "documentos" },
  { href: "/modulo/solicitacoes", label: "Solicitacoes",        icon: Inbox,        group: "RH Administrativo", roles: ["admin", "client"], module: "solicitacoes" },

  { href: "/crm",                 label: "CRM Interno",           icon: Layers,        group: "CRM", roles: ["admin", "client"], module: "crm" },
  { href: "/modulo/empresas",     label: "Empresas",              icon: Building,      group: "CRM", roles: ["admin", "client"], module: "empresas" },
  { href: "/modulo/contatos",     label: "Contatos",              icon: IdCard,        group: "CRM", roles: ["admin", "client"], module: "contatos" },
  { href: "/modulo/interacoes",   label: "Historico de Interacoes", icon: MessageSquare, group: "CRM", roles: ["admin", "client"], module: "interacoes" },
  { href: "/modulo/tarefas",      label: "Tarefas",               icon: CheckSquare,   group: "CRM", roles: ["admin", "client"], module: "tarefas" },
  { href: "/modulo/calendario",   label: "Calendario",            icon: CalendarDays,  group: "CRM", roles: ["admin", "client"], module: "calendario" },

  { href: "/modulo/suporte",      label: "Suporte",  icon: LifeBuoy, group: "Conta", roles: ["admin", "recruiter", "client"], module: "suporte" },
  { href: "/modulo/historico",    label: "Historico", icon: RotateCcw, group: "Conta", roles: ["admin", "recruiter", "client"], module: "historico" },

  { href: "/admin",               label: "Painel Admin",     icon: ShieldCheck, group: "Admin", roles: ["admin"] },
  { href: "/admin/jobs",          label: "Atribuicao de Vagas", icon: Network, group: "Admin", roles: ["admin"] },
  { href: "/admin/audit-logs",    label: "Audit Logs",       icon: RotateCcw,    group: "Admin", roles: ["admin"] },
];
