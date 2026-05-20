import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";
import type { Profile } from "@/types/database";

export function Topbar({ profile, title, companyName }: { profile: Profile; title: string; companyName?: string | null }) {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-[#ece5d4] h-[68px] flex items-center justify-between px-6">
      <div className="text-[15px] font-semibold">{title}</div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 bg-surface-2 rounded-full pl-1 pr-3 py-1">
          <div className="w-9 h-9 rounded-full bg-brand-purple text-brand-cream grid place-items-center font-bold">
            {(companyName || profile.name)[0]?.toUpperCase()}
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold">{companyName || profile.name}</div>
            <div className="text-[11px] text-ink-muted flex items-center gap-1.5">
              {profile.email}
              {profile.role === "admin" && <span className="ml-1 px-1.5 py-0.5 rounded bg-brand-sidebar text-brand-cream text-[9px] font-bold">admin</span>}
              {profile.role === "recruiter" && <span className="ml-1 px-1.5 py-0.5 rounded bg-brand-purple/15 text-brand-purple text-[9px] font-bold">recrutadora</span>}
            </div>
          </div>
        </div>
        <form action={logoutAction}>
          <button className="btn-ghost"><LogOut className="w-4 h-4" />Sair</button>
        </form>
      </div>
    </header>
  );
}
