import Link from "next/link";
import { Field } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Project } from "@/types/database";

export function ProjectForm({
  action, companies, project,
}: {
  action: (fd: FormData) => Promise<void>;
  companies: { id: string; nome: string }[];
  project?: Project;
}) {
  return (
    <form action={action} className="panel space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-ink-muted mb-1">Cliente</label>
          <select name="company_id" required className="input" defaultValue={project?.company_id ?? ""}>
            <option value="">Selecione...</option>
            {companies.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <Field label="Nome do projeto" name="nome" required defaultValue={project?.nome} />
        <Field label="Tipo de servico" name="tipo_servico" required defaultValue={project?.tipo_servico} />
        <div>
          <label className="block text-xs font-semibold text-ink-muted mb-1">Status</label>
          <select name="status" className="input" defaultValue={project?.status ?? "em_andamento"}>
            <option value="planejado">Planejado</option>
            <option value="em_andamento">Em andamento</option>
            <option value="atrasado">Atrasado</option>
            <option value="pausado">Pausado</option>
            <option value="concluido">Concluido</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <Field label="Progresso (%)" name="progresso" type="number" defaultValue={String(project?.progresso ?? 0)} />
        <Field label="Prazo" name="prazo_data" type="date" defaultValue={project?.prazo_data ?? ""} />
        <label className="flex items-center gap-2 self-center text-sm">
          <input type="checkbox" name="visible_to_client" defaultChecked={project?.visible_to_client ?? true} />
          Visivel para o cliente
        </label>
        <label className="flex items-center gap-2 self-center text-sm">
          <input type="checkbox" name="tem_recrutamento" defaultChecked={project?.tem_recrutamento ?? false} />
          Possui recrutamento (shortlist)
        </label>
      </div>
      <div>
        <label className="block text-xs font-semibold text-ink-muted mb-1">Descricao</label>
        <textarea name="descricao" rows={3} className="input" defaultValue={project?.descricao ?? ""} />
      </div>
      <div className="flex justify-end gap-2 pt-3 border-t border-[#ece5d4]">
        <Link href="/admin/projetos" className="btn-ghost">Cancelar</Link>
        <Button type="submit">{project ? "Salvar alteracoes" : "Criar projeto"}</Button>
      </div>
    </form>
  );
}
