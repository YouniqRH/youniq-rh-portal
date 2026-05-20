import { LoginForm } from "./form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string; error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <>
      <h2 className="text-2xl font-bold">Entrar</h2>
      <p className="text-ink-muted text-sm mb-5">Use seu email corporativo para acessar.</p>

      {sp.reset === "ok" && (
        <div className="rounded-lg bg-success/10 text-success border border-success/20 px-3 py-2 text-sm mb-3">
          Senha redefinida com sucesso. Faca login.
        </div>
      )}
      {sp.error === "forbidden" && (
        <div className="rounded-lg bg-danger/10 text-danger border border-danger/20 px-3 py-2 text-sm mb-3">
          Voce nao tem permissao para acessar aquela area.
        </div>
      )}

      <LoginForm next={sp.next} />

      <details className="mt-6 border-t border-[#e1d8c2] pt-4 text-xs text-ink-muted">
        <summary className="cursor-pointer font-semibold">Usuarios de demonstracao</summary>
        <div className="grid grid-cols-1 gap-2 mt-3">
          <div className="bg-surface-2 p-2 rounded"><strong>Admin</strong> admin@youniq.com.br / admin</div>
          <div className="bg-surface-2 p-2 rounded"><strong>Recrutadora</strong> recrutadora@youniq.com.br / recrutar123</div>
          <div className="bg-surface-2 p-2 rounded"><strong>Cliente Alpha</strong> cliente1@youniq.com.br / 123</div>
          <div className="bg-surface-2 p-2 rounded"><strong>Cliente Beta</strong> cliente2@empresa.com.br / abc</div>
        </div>
      </details>
    </>
  );
}
