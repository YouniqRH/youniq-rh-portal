import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateTime(d: string | Date | null | undefined) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export const STATUS_LABEL: Record<string, string> = {
  em_andamento: "Em andamento",
  concluido: "Concluido",
  atrasado: "Atrasado",
  pausado: "Pausado",
  planejado: "Planejado",
  cancelado: "Cancelado",
  aberto: "Aberto",
};

export const STAGE_LABEL: Record<string, string> = {
  triagem: "Triagem",
  entrevista_rh: "Entrevista RH",
  entrevista_gestor: "Entrevista Gestor",
  teste_tecnico: "Teste Tecnico",
  proposta: "Proposta",
  contratado: "Contratado",
  reprovado: "Reprovado",
};

export function labelStatus(s?: string | null) { return s ? (STATUS_LABEL[s] ?? s) : "—"; }
export function labelStage(s?: string | null)  { return s ? (STAGE_LABEL[s]  ?? s) : "—"; }
