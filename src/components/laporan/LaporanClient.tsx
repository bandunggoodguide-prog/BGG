"use client";

import { useEffect, useState } from "react";
import { formatRupiah, formatQty } from "@/lib/format";
import { RESTOCK_STATUS_LABEL, type RestockResult, type RestockStatus } from "@/lib/restock";

type Summary = {
  totalAmount: number;
  totalCost: number;
  profit: number;
  transactionCount: number;
  byType: Record<string, { count: number; totalAmount: number; totalCost: number }>;
  donationSubsidyEstimate: number;
  bestSellers: { productId: string; name: string; qty: number; revenue: number }[];
};

type RestockReport = {
  urgent: RestockResult[];
  segera: RestockResult[];
  stuck: RestockResult[];
  idle: RestockResult[];
};

const RANGE_PRESETS = [
  { key: "7", label: "7 Hari", days: 7 },
  { key: "30", label: "30 Hari", days: 30 },
  { key: "90", label: "90 Hari", days: 90 },
] as const;

const TYPE_LABEL: Record<string, string> = { UMUM: "Umum", B2B: "Grosir (B2B)", DONASI: "Donasi" };
const TYPE_COLOR: Record<string, string> = { UMUM: "bg-blue-500", B2B: "bg-green-500", DONASI: "bg-pink-500" };

const STATUS_BADGE: Record<RestockStatus, string> = {
  URGENT: "bg-red-100 text-red-700",
  SEGERA: "bg-amber-100 text-amber-700",
  AMAN: "bg-green-100 text-green-700",
  MACET: "bg-slate-200 text-slate-600",
  HABIS_TAK_LAKU: "bg-slate-100 text-slate-400",
};

export default function LaporanClient() {
  const [range, setRange] = useState<(typeof RANGE_PRESETS)[number]["key"]>("30");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [restock, setRestock] = useState<RestockReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"ringkasan" | "restock">("ringkasan");

  useEffect(() => {
    const days = RANGE_PRESETS.find((r) => r.key === range)!.days;
    const to = new Date();
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
    setLoading(true);
    Promise.all([
      fetch(`/api/reports/summary?from=${from.toISOString()}&to=${to.toISOString()}`).then((r) => r.json()),
      fetch(`/api/reports/restock?days=${days}`).then((r) => r.json()),
    ])
      .then(([s, r]) => {
        setSummary(s);
        setRestock(r);
      })
      .finally(() => setLoading(false));
  }, [range]);

  const maxBestSeller = summary?.bestSellers?.[0]?.qty ?? 1;

  return (
    <div className="pb-6">
      <div className="flex gap-2 mb-3">
        {RANGE_PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => setRange(p.key)}
            className={`btn-tap flex-1 h-10 rounded-xl text-sm font-semibold border ${
              range === p.key ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("ringkasan")}
          className={`btn-tap flex-1 h-10 rounded-xl text-sm font-bold ${tab === "ringkasan" ? "bg-brand-600 text-white" : "bg-white border border-slate-200 text-slate-500"}`}
        >
          Ringkasan
        </button>
        <button
          onClick={() => setTab("restock")}
          className={`btn-tap flex-1 h-10 rounded-xl text-sm font-bold ${tab === "restock" ? "bg-brand-600 text-white" : "bg-white border border-slate-200 text-slate-500"}`}
        >
          Prioritas Restock {restock && restock.urgent.length > 0 ? `(${restock.urgent.length})` : ""}
        </button>
      </div>

      {loading && <p className="text-center text-slate-400 py-10">Memuat laporan...</p>}

      {!loading && tab === "ringkasan" && summary && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <KpiCard label="Omzet" value={formatRupiah(summary.totalAmount)} />
            <KpiCard label="Keuntungan" value={formatRupiah(summary.profit)} highlight />
            <KpiCard label="Jumlah Transaksi" value={String(summary.transactionCount)} />
            <KpiCard label="Nilai Subsidi Donasi" value={formatRupiah(summary.donationSubsidyEstimate)} />
          </div>

          <section className="bg-white rounded-2xl p-4 border border-slate-100">
            <p className="font-bold mb-3">Penjualan per Jenis Pembeli</p>
            <div className="space-y-3">
              {Object.entries(summary.byType).map(([type, v]) => {
                const pct = summary.totalAmount > 0 ? Math.round((v.totalAmount / summary.totalAmount) * 100) : 0;
                return (
                  <div key={type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{TYPE_LABEL[type] ?? type}</span>
                      <span className="text-slate-500">{v.count}x · {formatRupiah(v.totalAmount)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${TYPE_COLOR[type] ?? "bg-slate-400"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bg-white rounded-2xl p-4 border border-slate-100">
            <p className="font-bold mb-3">Produk Terlaris</p>
            {summary.bestSellers.length === 0 && <p className="text-sm text-slate-400">Belum ada penjualan.</p>}
            <div className="space-y-2.5">
              {summary.bestSellers.map((b, idx) => (
                <div key={b.productId}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="truncate font-medium">{idx + 1}. {b.name}</span>
                    <span className="text-slate-500 shrink-0 ml-2">{b.qty} terjual</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500" style={{ width: `${(b.qty / maxBestSeller) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {!loading && tab === "restock" && restock && (
        <div className="space-y-4">
          <RestockSection
            title="Mendesak - segera belanja"
            items={restock.urgent}
            emptyText="Tidak ada produk yang mendesak direstock."
          />
          <RestockSection
            title="Segera direstock"
            items={restock.segera}
            emptyText="Tidak ada produk yang perlu direstock minggu ini."
          />
          <RestockSection
            title="Stuck - modal mengendap"
            items={restock.stuck}
            emptyText="Tidak ada produk yang stuck."
            showTiedUp
          />
          {restock.idle.length > 0 && (
            <section className="bg-white rounded-2xl p-4 border border-slate-100">
              <p className="font-bold mb-2">Habis &amp; Kurang Laku ({restock.idle.length})</p>
              <p className="text-xs text-slate-500 mb-2">
                Stok kosong dan tidak ada penjualan dalam periode ini. Pertimbangkan sebelum restock lagi.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {restock.idle.map((i) => (
                  <span key={i.productId} className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                    {i.name}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-lg font-extrabold ${highlight ? "text-brand-700" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}

function RestockSection({
  title,
  items,
  emptyText,
  showTiedUp,
}: {
  title: string;
  items: RestockResult[];
  emptyText: string;
  showTiedUp?: boolean;
}) {
  return (
    <section className="bg-white rounded-2xl p-4 border border-slate-100">
      <p className="font-bold mb-3">
        {title} ({items.length})
      </p>
      {items.length === 0 && <p className="text-sm text-slate-400">{emptyText}</p>}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{item.name}</p>
              <p className="text-xs text-slate-500">
                Stok: {formatQty(item.stock, item.unit)}
                {item.daysOfStockLeft !== null && ` · cukup ${Math.max(0, Math.round(item.daysOfStockLeft))} hari lagi`}
                {showTiedUp && ` · modal mengendap ${formatRupiah(item.tiedUpCapital)}`}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[item.status]}`}>
                {RESTOCK_STATUS_LABEL[item.status]}
              </span>
              {item.suggestedRestockQty > 0 && (
                <p className="text-xs text-slate-600 mt-1">Saran: +{formatQty(item.suggestedRestockQty, item.unit)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
