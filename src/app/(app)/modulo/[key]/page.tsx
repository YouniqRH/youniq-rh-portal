import { notFound } from "next/navigation";
import Link from "next/link";
import { LifeBuoy } from "lucide-react";
import { requireAuth } from "@/lib/auth/guards";
import { getSessionContext } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";

const MODULES: Record<string, { titulo: string; descricao: string; kpis: [string, string][] }> = {
  admissao: {
    titulo: "Admissao & Demissao",
    descricao: "Processos de admissao, exames admissionais, documentos pendentes e desligamentos.",
    kpis: [["Admissoes em andamento", "8"], ["Documentos pendentes", "3"], ["Exames marcados", "5"], ["Desligamentos no mes", "2"]],
  },
  "folha-ponto": {
    titulo: "Folha de Ponto",
    descricao: "Folha de ponto da equipe, batidas, horas extras e ajustes.",
    kpis: [["Batidas hoje", "142"], ["Horas extras (mes)", "37h"], ["Ajustes pendentes", "6"], ["Atrasos no mes", "11"]],
  },
  treinamentos: {
    titulo: "Treinamentos",
    descricao: "Trilhas, capacitacoes obrigatorias, certificados e proximas turmas.",
    kpis: [["Trilhas ativas", "4"], ["Colaboradores em treinamento", "23"], ["Certificados emitidos", "58"], ["Proxima turma", "20/05"]],
  },
  assessments: {
    titulo: "Assessments",
    descricao: "Avaliacoes comportamentais e tecnicas, relatorios de performance.",
    kpis: [["Em andamento", "12"], ["Concluidos no mes", "7"], ["Lideranca avaliada", "9 de 14"], ["Score medio", "78"]],
  },
  documentos: {
    titulo: "Documentos",
    descricao: "Contratos, politicas internas, manuais e holerites - via signed URL.",
    kpis: [["Contratos vigentes", "46"], ["Politicas publicadas", "12"], ["Holerites disponiveis", "156"], ["Manuais", "4"]],
  },
  solicitacoes: {
    titulo: "Solicitacoes",
    descricao: "Abertura de solicitacoes: ferias, beneficios, alteracoes contratuais.",
    kpis: [["Abertas", "14"], ["Em analise", "6"], ["Aprovadas no mes", "22"], ["SLA medio", "1.4 dias"]],
  },
  empresas: {
    titulo: "Empresas",
    descricao: "Empresas relacionadas a interacoes na sua conta.",
    kpis: [["Empresas ativas", "1"], ["Contatos cadastrados", "3"], ["Interacoes no mes", "12"], ["Status", "OK"]],
  },
  contatos: {
    titulo: "Contatos",
    descricao: "Pessoas envolvidas nas interacoes.",
    kpis: [["Total", "3"], ["Ativos", "3"], ["Ultimo contato", "Hoje"], ["Em follow-up", "1"]],
  },
  interacoes: {
    titulo: "Historico de Interacoes",
    descricao: "Timeline completa das interacoes.",
    kpis: [["Total", "32"], ["Este mes", "12"], ["Esta semana", "4"], ["Em aberto", "3"]],
  },
  tarefas: {
    titulo: "Tarefas",
    descricao: "Tarefas do time Youniq alocadas para o seu projeto.",
    kpis: [["Tarefas suas", "7"], ["Atrasadas", "1"], ["Concluidas no mes", "24"], ["Para esta semana", "5"]],
  },
  calendario: {
    titulo: "Calendario",
    descricao: "Agenda de entrevistas, reunioes, prazos e datas importantes.",
    kpis: [["Eventos esta semana", "6"], ["Entrevistas marcadas", "4"], ["Reunioes", "3"], ["Prazos vencendo", "2"]],
  },
  suporte: {
    titulo: "Suporte",
    descricao: "Canal de atendimento Youniq: abra um chamado ou consulte os existentes.",
    kpis: [["Chamados abertos", "3"], ["Resolvidos no mes", "17"], ["Tempo medio resposta", "2h12"], ["Satisfacao", "98%"]],
  },
  historico: {
    titulo: "Historico",
    descricao: "Linha do tempo das suas interacoes com a Youniq RH.",
    kpis: [["Eventos registrados", "124"], ["Esta semana", "11"], ["Este mes", "47"], ["Total no ano", "418"]],
  },
  etapas: {
    titulo: "Etapas do Processo",
    descricao: "Visualizacao Kanban dos candidatos por etapa.",
    kpis: [["Triagem", "—"], ["Entrevista RH", "—"], ["Entrevista Gestor", "—"], ["Proposta", "—"]],
  },
};

export default async function ModuloPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const def = MODULES[key];
  if (!def) notFound();

  await requireAuth();
  const ctx = await getSessionContext();
  // Cliente: respeita visible_modules. Recrutadora/admin: passa.
  if (ctx && ctx.profile.role === "client") {
    const moduleKey = key.replace("-", "_");
    if (!ctx.visibleModules.has(moduleKey)) notFound();
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">{def.titulo}</h1>
        <p className="text-ink-muted">{def.descricao}</p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {def.kpis.map(([label, value]) => (
          <Card key={label} className="p-4">
            <div className="text-[11px] uppercase tracking-wider text-ink-muted">{label}</div>
            <div className="text-2xl font-bold mt-2">{value}</div>
          </Card>
        ))}
      </section>

      <section className="panel flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-bold">Modulo em produtizacao</h2>
          <p className="text-ink-muted text-sm">
            Este modulo ja respeita as policies RLS e a visibilidade contratada.
            A versao completa exibira filtros, listas e exportacoes em tempo real.
          </p>
        </div>
        <Link href="/modulo/suporte" className="btn-primary"><LifeBuoy className="w-4 h-4" />Falar com a Youniq</Link>
      </section>
    </div>
  );
}
