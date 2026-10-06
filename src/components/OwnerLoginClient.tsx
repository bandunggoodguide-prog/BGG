"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import NumPad from "@/components/NumPad";

export default function OwnerLoginClient() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/laporan";

  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (pin.length < 4 || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/owner/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal membuka");
        setPin("");
        return;
      }
      // Hard navigation (bukan router.push) supaya proxy mengevaluasi ulang
      // dengan cookie yang baru saja diset, tidak kena cache navigasi client.
      window.location.href = next;
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-slate-50">
      <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto mb-3">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8">
          <rect x="4" y="11" width="16" height="9" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" strokeLinecap="round" />
        </svg>
      </div>
      <h1 className="text-xl font-bold mb-1">Mode Pemilik</h1>
      <p className="text-sm text-slate-500 mb-6 text-center px-4">
        Masukkan PIN pemilik untuk membuka Riwayat &amp; Laporan
      </p>

      <div className="flex gap-3 mb-6">
        {Array.from({ length: Math.max(pin.length + 1, 4) }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 ${i < pin.length ? "bg-brand-600 border-brand-600" : "border-slate-300"}`}
          />
        ))}
      </div>

      {error && <p className="text-red-600 text-sm mb-4 font-medium text-center px-4">{error}</p>}

      <NumPad value={pin} onChange={setPin} maxLength={6} />

      <button
        onClick={submit}
        disabled={pin.length < 4 || loading}
        className="btn-tap mt-6 w-full max-w-xs h-14 rounded-2xl bg-brand-600 text-white text-lg font-semibold disabled:opacity-40 disabled:pointer-events-none shadow"
      >
        {loading ? "Memeriksa..." : "Buka"}
      </button>

      <a href="/kasir" className="mt-4 text-sm text-slate-400">
        ← Kembali ke Kasir
      </a>
    </div>
  );
}
