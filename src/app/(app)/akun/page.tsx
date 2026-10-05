import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

export default async function AkunPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-600 text-white text-3xl font-bold flex items-center justify-center mx-auto mb-3">
          {session.name.charAt(0).toUpperCase()}
        </div>
        <p className="text-lg font-semibold">{session.name}</p>
        <p className="text-sm text-slate-500">{session.role === "OWNER" ? "Pemilik Warung" : "Pegawai / Kasir"}</p>
      </div>

      {session.role === "OWNER" && (
        <Link
          href="/pengguna"
          className="btn-tap flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
        >
          <span className="font-medium">Kelola Pengguna &amp; Pegawai</span>
          <span className="text-slate-400">→</span>
        </Link>
      )}

      <LogoutButton />
    </div>
  );
}
