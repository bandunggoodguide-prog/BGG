"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getProductEmoji, getColorClass } from "@/lib/icons";
import { formatRupiah, formatQty } from "@/lib/format";
import type { Product } from "@/lib/types";
import ProductFormModal from "./ProductFormModal";

type ImportResult = {
  totalRows: number;
  created: number;
  updated: number;
  errorCount: number;
  errors: { row: number; name: string; reason: string }[];
};

export default function ProdukClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/products?all=1")
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))).sort(), [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(
      (p) => !q || p.name.toLowerCase().includes(q) || (p.barcode ?? "").includes(q)
    );
  }, [products, search]);

  function closeModal() {
    setEditing(null);
    setCreating(false);
  }

  function handleSaved() {
    closeModal();
    load();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // supaya file yang sama bisa dipilih lagi nanti
    if (!file) return;

    setImporting(true);
    setImportError(null);
    try {
      const text = await file.text();
      const res = await fetch("/api/products/import", {
        method: "POST",
        headers: { "Content-Type": "text/csv" },
        body: text,
      });
      const data = await res.json();
      if (!res.ok) {
        setImportError(data.error ?? "Gagal mengimpor file");
        return;
      }
      setImportResult(data);
      load();
    } catch {
      setImportError("Tidak bisa membaca atau mengirim file ini");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="pb-6">
      <div className="flex gap-2 mb-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari produk..."
          className="flex-1 h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm"
        />
        <button
          onClick={() => setCreating(true)}
          className="btn-tap w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center text-2xl font-bold shrink-0"
        >
          +
        </button>
      </div>

      <div className="flex gap-2 mb-3">
        <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileSelected} />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="btn-tap flex-1 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-semibold disabled:opacity-50"
        >
          {importing ? "Mengimpor..." : "Impor dari CSV/Excel"}
        </button>
        <a
          href="/api/export/products"
          className="btn-tap h-10 px-3 rounded-xl bg-white border border-slate-200 text-slate-500 text-xs font-semibold flex items-center"
        >
          Unduh format
        </a>
      </div>

      {importError && <p className="text-red-600 text-xs mb-3">{importError}</p>}

      {loading && <p className="text-center text-slate-400 py-10">Memuat produk...</p>}

      <div className="space-y-2">
        {filtered.map((p) => {
          const low = p.stock <= p.minStock;
          return (
            <button
              key={p.id}
              onClick={() => setEditing(p)}
              className={`btn-tap w-full flex items-center gap-3 bg-white rounded-2xl p-3 border text-left ${
                p.active ? "border-slate-100" : "border-red-100 opacity-60"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${getColorClass(p.color)}`}>
                {getProductEmoji(p.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{p.name}</p>
                <p className="text-xs text-slate-400">{p.category} · {formatRupiah(p.priceRegular)}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-bold ${low ? "text-red-500" : "text-slate-700"}`}>{formatQty(p.stock, p.unit)}</p>
                {low && <p className="text-[10px] text-red-500">Stok menipis</p>}
                {!p.active && <p className="text-[10px] text-red-400">Nonaktif</p>}
              </div>
            </button>
          );
        })}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-slate-400 py-10 text-sm">Belum ada produk ditemukan.</p>
        )}
      </div>

      {(editing || creating) && (
        <ProductFormModal
          mode={creating ? "create" : "edit"}
          product={editing ?? undefined}
          categories={categories}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}

      {importResult && (
        <div className="fixed inset-0 bg-black/40 z-[70] flex items-end" onClick={() => setImportResult(null)}>
          <div className="bg-white w-full rounded-t-3xl px-5 pt-5 pb-8 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-lg">Hasil Impor</p>
              <button onClick={() => setImportResult(null)} className="text-slate-400 text-sm">Tutup</button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-brand-50 rounded-xl p-3 text-center">
                <p className="text-xl font-extrabold text-brand-700">{importResult.created}</p>
                <p className="text-[11px] text-slate-500">Produk baru</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xl font-extrabold text-blue-700">{importResult.updated}</p>
                <p className="text-[11px] text-slate-500">Diperbarui</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <p className="text-xl font-extrabold text-red-600">{importResult.errorCount}</p>
                <p className="text-[11px] text-slate-500">Gagal</p>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Baris yang gagal:</p>
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {importResult.errors.map((e, idx) => (
                    <div key={idx} className="text-xs bg-red-50 text-red-700 rounded-lg px-3 py-2">
                      Baris {e.row} ({e.name}): {e.reason}
                    </div>
                  ))}
                </div>
                {importResult.errorCount > importResult.errors.length && (
                  <p className="text-xs text-slate-400 mt-2">
                    +{importResult.errorCount - importResult.errors.length} baris gagal lainnya tidak ditampilkan.
                  </p>
                )}
              </div>
            )}

            <button
              onClick={() => setImportResult(null)}
              className="btn-tap w-full h-12 rounded-2xl bg-brand-600 text-white font-bold mt-4"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
