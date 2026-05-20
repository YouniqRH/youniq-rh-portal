import { redirect } from "next/navigation";
import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";
import { getSessionContext } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");

  return (
    <div className="min-h-screen">
      <Sidebar role={ctx.profile.role} visibleModules={ctx.visibleModules} />
      <div className="pl-64">
        <Topbar profile={ctx.profile} title="Portal" companyName={ctx.companyName} />
        <main className="p-6 lg:p-8 max-w-[1480px]">{children}</main>
      </div>
    </div>
  );
}
