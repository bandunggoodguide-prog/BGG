"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getProductEmoji, getColorClass } from "@/lib/icons";
import { formatRupiah, formatQty } from "@/lib/format";
import type { Product } from "@/lib/types";
import ProductFormModal from "./ProductFormModal";

export default function ProdukClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

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

  return (
    <div className="pb-6">
      <div className="flex gap-2 mb-3">
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
    </div>
  );
}
