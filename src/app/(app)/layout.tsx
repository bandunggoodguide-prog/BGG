import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import BottomNav from "@/components/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-30 bg-brand-600 text-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-xs text-brand-100 leading-none">Warung Kita</p>
          <p className="font-semibold leading-tight">{session.name}</p>
        </div>
        <span className="text-xs bg-brand-700/60 px-2 py-1 rounded-full font-medium">
          {session.role === "OWNER" ? "Pemilik" : "Pegawai"}
        </span>
      </header>
      <main className="px-3 py-3">{children}</main>
      <BottomNav role={session.role} />
    </div>
  );
}
