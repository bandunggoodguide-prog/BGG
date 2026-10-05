"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDateTime, formatRupiah, customerTypeLabel } from "@/lib/format";
import ReceiptView, { type ReceiptData } from "@/components/ReceiptView";
import type { Role } from "@/lib/auth";

type TxItem = { productName: string; qty: number; unitPrice: number; subtotal: number };
type Tx = {
  id: string;
  code: string;
  createdAt: string;
  customerType: string;
  customerNote: string | null;
  totalAmount: number;
  totalCost: number | null;
  cashReceived: number | null;
  changeAmount: number | null;
  cashier: { name: string };
  items: TxItem[];
};

const PRESETS = [
  { key: "today", label: "Hari Ini" },
  { key: "7d", label: "7 Hari" },
  { key: "30d", label: "30 Hari" },
] as const;

const BADGE_CLASS: Record<string, string> = {
  UMUM: "bg-blue-50 text-blue-700",
  B2B: "bg-green-50 text-green-700",
  DONASI: "bg-pink-50 text-pink-700",
};

export default function RiwayatClient({ role }: { role: Role }) {
  const [preset, setPreset] = useState<(typeof PRESETS)[number]["key"]>("today");
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Tx | null>(null);

  useEffect(() => {
    const now = new Date();
    const from = new Date(now);
    if (preset === "today") from.setHours(0, 0, 0, 0);
    if (preset === "7d") from.setDate(from.getDate() - 7);
    if (preset === "30d") from.setDate(from.getDate() - 30);

    setLoading(true);
    fetch(`/api/transactions?from=${from.toISOString()}&to=${now.toISOString()}&limit=100`)
      .then((r) => r.json())
      .then((data) => setTransactions(data.transactions ?? []))
      .finally(() => setLoading(false));
  }, [preset]);

  const totalToday = useMemo(() => transactions.reduce((s, t) => s + t.totalAmount, 0), [transactions]);

  return (
    <div className="pb-6">
      <div className="flex gap-2 mb-3">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPreset(p.key)}
            className={`btn-tap flex-1 h-10 rounded-xl text-sm font-semibold border ${
              preset === p.key ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-100 mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Total Transaksi</p>
          <p className="font-bold">{transactions.length}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Total Penjualan</p>
          <p className="font-bold text-brand-700">{formatRupiah(totalToday)}</p>
        </div>
      </div>

      {loading && <p className="text-center text-slate-400 py-10">Memuat...</p>}

      <div className="space-y-2">
        {transactions.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelected(t)}
            className="btn-tap w-full bg-white rounded-2xl p-3 border border-slate-100 text-left"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-sm">{t.code}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${BADGE_CLASS[t.customerType]}`}>
                {customerTypeLabel(t.customerType)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{formatDateTime(t.createdAt)} · {t.cashier.name}</span>
              <span className="font-bold text-slate-900 text-sm">{formatRupiah(t.totalAmount)}</span>
            </div>
          </button>
        ))}
        {!loading && transactions.length === 0 && (
          <p className="text-center text-slate-400 py-10 text-sm">Belum ada transaksi pada periode ini.</p>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-end" onClick={() => setSelected(null)}>
          <div className="bg-slate-50 w-full rounded-t-3xl px-5 pt-5 pb-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-lg">Detail Transaksi</p>
              <button onClick={() => setSelected(null)} className="text-slate-400 text-sm">Tutup</button>
            </div>
            <ReceiptView data={selected as unknown as ReceiptData} />
            {role === "OWNER" && selected.totalCost !== null && (
              <div className="bg-white rounded-2xl p-4 border border-slate-100 mt-3 flex justify-between">
                <span className="text-sm text-slate-500">Keuntungan transaksi ini</span>
                <span className="font-bold text-brand-700">{formatRupiah(selected.totalAmount - selected.totalCost)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
