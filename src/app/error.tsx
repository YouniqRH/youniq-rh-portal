"use client";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const isForbidden = error.name === "ForbiddenError" || /403|negado|nao tem permissao/i.test(error.message);
  return (
    <div className="min-h-screen grid place-items-center p-6 bg-brand-cream">
      <div className="bg-white rounded-3xl shadow-lg p-12 text-center max-w-md">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-purple text-brand-cream font-extrabold text-3xl grid place-items-center mb-5">Y</div>
        <h1 className="text-5xl font-bold text-brand-purple mb-2">{isForbidden ? "403" : "Ops"}</h1>
        <p className="text-ink-muted mb-6">{isForbidden ? "Voce nao tem permissao para acessar este recurso." : error.message || "Algo deu errado."}</p>
        <div className="space-x-2">
          <a href="/dashboard" className="btn-primary">Voltar ao inicio</a>
          <button onClick={reset} className="btn-ghost">Tentar novamente</button>
        </div>
      </div>
    </div>
  );
}
