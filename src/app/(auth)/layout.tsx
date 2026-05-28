import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid place-items-center p-5 bg-gradient-to-br from-brand-cream to-brand-cream-2">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-lg grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] overflow-hidden">
        <aside className="hidden lg:flex items-center bg-gradient-to-br from-brand-sidebar to-[#15102a] text-white p-14">
          <div>
            <Image
              src="/youniq-logo.png"
              alt="Youniq RH"
              width={260}
              height={325}
              priority
              className="w-auto h-44 object-contain mb-6 drop-shadow-[0_6px_20px_rgba(0,0,0,0.25)]"
            />
            <p className="text-brand-cream uppercase tracking-[3px] text-xs">Portal do Cliente</p>
            <p className="text-[#d9d3e4] mt-7 max-w-xs leading-relaxed">
              Acompanhe seus projetos de recrutamento, shortlist ao vivo, CRM interno e servicos administrativos de RH em um unico lugar.
            </p>
            <ul className="mt-7 space-y-2 text-brand-cream">
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-brand-cream" /> Projetos em tempo real</li>
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-brand-cream" /> Shortlist continuo de candidatos</li>
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-brand-cream" /> Documentos centralizados</li>
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-brand-cream" /> Atendimento e SLAs</li>
            </ul>
          </div>
        </aside>
        <section className="p-10 lg:p-14 grid place-items-center">
          <div className="w-full max-w-sm">{children}</div>
        </section>
      </div>
    </div>
  );
}
