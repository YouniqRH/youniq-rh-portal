import { requireAuth } from "@/lib/auth/guards";
import { Card } from "@/components/ui/card";

export default async function CRMPage() {
  const profile = await requireAuth();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">CRM Interno</h1>
        <p className="text-ink-muted">Interacoes ativas com sua conta na Youniq RH.</p>
      </header>

      <Card className="p-10 text-center text-ink-muted">
        <p className="text-sm max-w-md mx-auto">
          O modulo de CRM completo (interacoes, prioridade, responsavel, historico) sera disponibilizado
          em breve. Esta tela ja respeita as policies de RLS: voce visualizara apenas
          {profile.role === "client" ? " interacoes da sua empresa" : profile.role === "recruiter" ? " interacoes dos seus projetos" : " todos os registros"}.
        </p>
      </Card>
    </div>
  );
}
