"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./sidebar-config";
import type { UserRole } from "@/types/database";

export function Sidebar({
  role,
  visibleModules,
}: {
  role: UserRole;
  visibleModules: Set<string>;
}) {
  const pathname = usePathname();

  const items = NAV_ITEMS.filter((it) => {
    if (!it.roles.includes(role)) return false;
    if (role === "client" && it.module && !visibleModules.has(it.module)) return false;
    return true;
  });

  const groups: string[] = [];
  for (const it of items) if (!groups.includes(it.group)) groups.push(it.group);

  return (
    <aside className="bg-gradient-to-b from-brand-sidebar to-brand-sidebar-2 text-[#d9d3e4] w-64 fixed inset-y-0 left-0 flex flex-col z-30">
      <div className="px-5 pt-5 pb-4 border-b border-[#2f2349] flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/youniq-logo.png"
          alt="Youniq RH"
          className="w-12 h-12 object-contain rounded-lg bg-white/5 p-1"
          onError={(e) => {
            const img = e.currentTarget;
            const fallback = document.createElement("div");
            fallback.className = "w-10 h-10 rounded-xl bg-brand-purple text-brand-cream font-extrabold grid place-items-center shadow-md";
            fallback.textContent = "Y";
            img.replaceWith(fallback);
          }}
        />
        <div className="leading-tight">
          <div className="text-brand-gold-2 font-bold tracking-wide">YOUNIQ<sup className="text-[10px] text-brand-gold ml-0.5">RH</sup></div>
          <div className="text-[10px] uppercase tracking-[1.5px] text-[#8d83a2]">Portal do Cliente</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {groups.map((g) => (
          <div key={g}>
            <div className="px-3 pt-3 pb-1.5 text-[10px] uppercase tracking-[1.5px] text-[#8d83a2]">{g}</div>
            {items
              .filter((it) => it.group === g)
              .map((it) => {
                const active = pathname === it.href || pathname.startsWith(it.href + "/");
                const Icon = it.icon;
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium mb-0.5 transition-colors",
                      active
                        ? "bg-brand-purple text-white shadow-[0_6px_18px_rgba(95,46,129,.4)]"
                        : "text-[#d9d3e4] hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <Icon className="w-[18px] h-[18px] opacity-90" />
                    <span>{it.label}</span>
                  </Link>
                );
              })}
          </div>
        ))}
      </nav>

      <div className="px-5 py-3 border-t border-[#2f2349] text-[11px] text-[#8d83a2]">v1.0 - 2026</div>
    </aside>
  );
}
