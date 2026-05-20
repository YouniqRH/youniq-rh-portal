export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center p-6 bg-brand-cream">
      <div className="bg-white rounded-3xl shadow-lg p-12 text-center max-w-md">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-purple text-brand-cream font-extrabold text-3xl grid place-items-center mb-5">Y</div>
        <h1 className="text-5xl font-bold text-brand-purple mb-2">404</h1>
        <p className="text-ink-muted mb-6">Pagina nao encontrada.</p>
        <a href="/dashboard" className="btn-primary">Voltar ao inicio</a>
      </div>
    </div>
  );
}
