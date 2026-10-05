"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NumPad from "@/components/NumPad";

type LoginUser = { id: string; name: string; role: "OWNER" | "EMPLOYEE" };

export default function LoginPage() {
  const router = useRouter();
  const [users, setUsers] = useState<LoginUser[] | null>(null);
  const [selected, setSelected] = useState<LoginUser | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/users")
      .then((r) => r.json())
      .then((data) => setUsers(data.users ?? []))
      .catch(() => setUsers([]));
  }, []);

  async function submit() {
    if (!selected || pin.length < 4 || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selected.id, pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal login");
        setPin("");
        return;
      }
      router.push("/kasir");
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  if (selected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-slate-50">
        <button
          onClick={() => {
            setSelected(null);
            setPin("");
            setError(null);
          }}
          className="self-start mb-6 text-slate-500 flex items-center gap-1 text-sm"
        >
          ← Ganti pengguna
        </button>

        <div className="w-20 h-20 rounded-full bg-brand-600 text-white text-3xl font-bold flex items-center justify-center mb-3">
          {selected.name.charAt(0).toUpperCase()}
        </div>
        <p className="text-lg font-semibold mb-1">{selected.name}</p>
        <p className="text-sm text-slate-500 mb-6">Masukkan PIN kamu</p>

        <div className="flex gap-3 mb-6">
          {Array.from({ length: Math.max(pin.length + 1, 4) }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 ${
                i < pin.length ? "bg-brand-600 border-brand-600" : "border-slate-300"
              }`}
            />
          ))}
        </div>

        {error && <p className="text-red-600 text-sm mb-4 font-medium">{error}</p>}

        <NumPad value={pin} onChange={setPin} maxLength={6} />

        <button
          onClick={submit}
          disabled={pin.length < 4 || loading}
          className="btn-tap mt-6 w-full max-w-xs h-14 rounded-2xl bg-brand-600 text-white text-lg font-semibold disabled:opacity-40 disabled:pointer-events-none shadow"
        >
          {loading ? "Memeriksa..." : "Masuk"}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-slate-50">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-3">
          W
        </div>
        <h1 className="text-xl font-bold">Warung Kita</h1>
        <p className="text-sm text-slate-500">Pilih nama kamu untuk masuk</p>
      </div>

      {users === null && <p className="text-slate-400">Memuat...</p>}
      {users !== null && users.length === 0 && (
        <p className="text-slate-400 text-center text-sm px-6">
          Belum ada pengguna terdaftar. Hubungi pemilik warung untuk didaftarkan.
        </p>
      )}

      <div className="w-full max-w-sm grid grid-cols-3 gap-4">
        {users?.map((u) => (
          <button
            key={u.id}
            onClick={() => setSelected(u)}
            className="btn-tap flex flex-col items-center gap-2"
          >
            <div className="w-16 h-16 rounded-full bg-white border border-slate-200 shadow-sm text-brand-700 text-2xl font-bold flex items-center justify-center">
              {u.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-medium text-slate-700 text-center leading-tight">{u.name}</span>
            <span className="text-[10px] text-slate-400">{u.role === "OWNER" ? "Pemilik" : "Pegawai"}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
