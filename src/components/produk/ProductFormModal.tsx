"use client";

import { useState } from "react";
import { ICON_OPTIONS, COLOR_OPTIONS, getProductEmoji, getColorClass } from "@/lib/icons";
import type { Product } from "@/lib/types";

const UNIT_OPTIONS = ["pcs", "kg", "ons", "liter", "botol", "dus", "pak", "ikat", "bungkus", "sachet"];

export default function ProductFormModal({
  mode,
  product,
  categories,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  product?: Product;
  categories: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [barcode, setBarcode] = useState(product?.barcode ?? "");
  const [category, setCategory] = useState(product?.category ?? (categories[0] || "Lainnya"));
  const [unit, setUnit] = useState(product?.unit ?? "pcs");
  const [icon, setIcon] = useState(product?.icon ?? "package");
  const [color, setColor] = useState(product?.color ?? "slate");
  const [costPrice, setCostPrice] = useState(String(product?.costPrice ?? ""));
  const [priceRegular, setPriceRegular] = useState(String(product?.priceRegular ?? ""));
  const [priceB2B, setPriceB2B] = useState(String(product?.priceB2B ?? ""));
  const [priceDonation, setPriceDonation] = useState(String(product?.priceDonation ?? ""));
  const [stock, setStock] = useState(String(product?.stock ?? "0"));
  const [minStock, setMinStock] = useState(String(product?.minStock ?? "5"));
  const [quickAccess, setQuickAccess] = useState(product?.quickAccess ?? true);
  const [restockQty, setRestockQty] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveFull() {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name,
        barcode,
        category,
        unit,
        icon,
        color,
        costPrice: Number(costPrice || 0),
        priceRegular: Number(priceRegular || 0),
        priceB2B: Number(priceB2B || 0),
        priceDonation: Number(priceDonation || 0),
        stock: Number(stock || 0),
        minStock: Number(minStock || 0),
        quickAccess,
      };
      const res = await fetch(mode === "create" ? "/api/products" : `/api/products/${product!.id}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan");
        return;
      }
      onSaved();
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setSaving(false);
    }
  }

  async function deactivate() {
    if (!product) return;
    if (!confirm(`Nonaktifkan produk "${product.name}"? Produk tidak akan tampil lagi di kasir.`)) return;
    setSaving(true);
    await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    onSaved();
  }

  async function submitRestock() {
    if (!product || !restockQty) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${product.id}/restock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qty: Number(restockQty), note: "Stok masuk via kasir" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal menambah stok");
        return;
      }
      onSaved();
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-end">
      <div className="bg-white w-full rounded-t-3xl px-5 pt-5 pb-8 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold text-lg">{mode === "create" ? "Tambah Produk" : "Edit Produk"}</p>
          <button onClick={onClose} className="text-slate-400 text-sm">Tutup</button>
        </div>

        <label className="text-xs font-semibold text-slate-500">Nama Produk</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-12 rounded-xl border border-slate-200 px-3 mb-3 mt-1" />

        <label className="text-xs font-semibold text-slate-500">Barcode (opsional, kosongkan jika barang curah)</label>
        <input value={barcode} onChange={(e) => setBarcode(e.target.value)} className="w-full h-12 rounded-xl border border-slate-200 px-3 mb-3 mt-1" />

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-semibold text-slate-500">Kategori</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              list="category-list"
              className="w-full h-12 rounded-xl border border-slate-200 px-3 mt-1"
            />
            <datalist id="category-list">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Satuan</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full h-12 rounded-xl border border-slate-200 px-3 mt-1">
              {UNIT_OPTIONS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        <label className="text-xs font-semibold text-slate-500">Ikon</label>
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 mb-2">
          {ICON_OPTIONS.map((key) => (
            <button
              key={key}
              onClick={() => setIcon(key)}
              className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl border-2 ${
                icon === key ? "border-brand-600" : "border-transparent"
              } ${getColorClass(color)}`}
            >
              {getProductEmoji(key)}
            </button>
          ))}
        </div>

        <label className="text-xs font-semibold text-slate-500">Warna</label>
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 mb-3">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`shrink-0 w-9 h-9 rounded-full border-2 ${color === c ? "border-slate-900" : "border-transparent"} ${getColorClass(c)}`}
            />
          ))}
        </div>

        <p className="text-xs font-semibold text-slate-500 mb-1">Harga Jual (3 tingkat)</p>
        <div className="space-y-2 mb-3">
          <PriceField label="Harga Umum (pembeli biasa)" value={priceRegular} onChange={setPriceRegular} />
          <PriceField label="Harga Grosir (antar warung / B2B)" value={priceB2B} onChange={setPriceB2B} />
          <PriceField label="Harga Donasi (sosial / spesial)" value={priceDonation} onChange={setPriceDonation} />
          <PriceField label="Harga Modal (untuk hitung keuntungan)" value={costPrice} onChange={setCostPrice} />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-semibold text-slate-500">Stok saat ini</label>
            <input type="number" inputMode="decimal" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full h-12 rounded-xl border border-slate-200 px-3 mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Stok minimum (peringatan)</label>
            <input type="number" inputMode="decimal" value={minStock} onChange={(e) => setMinStock(e.target.value)} className="w-full h-12 rounded-xl border border-slate-200 px-3 mt-1" />
          </div>
        </div>

        {mode === "edit" && (
          <div className="mb-3">
            <label className="text-xs font-semibold text-slate-500">Tambah stok cepat (barang baru datang)</label>
            <div className="flex gap-2 mt-1">
              <input
                type="number"
                inputMode="decimal"
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)}
                placeholder={`Jumlah (${unit})`}
                className="flex-1 h-12 rounded-xl border border-slate-200 px-3"
              />
              <button
                onClick={submitRestock}
                disabled={!restockQty || saving}
                className="btn-tap px-5 rounded-xl bg-brand-50 text-brand-700 font-semibold disabled:opacity-40"
              >
                Tambah
              </button>
            </div>
          </div>
        )}

        <label className="flex items-center gap-2 mb-5">
          <input type="checkbox" checked={quickAccess} onChange={(e) => setQuickAccess(e.target.checked)} className="w-5 h-5" />
          <span className="text-sm">Tampilkan di grid cepat kasir</span>
        </label>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <button onClick={saveFull} disabled={saving || !name} className="btn-tap w-full h-14 rounded-2xl bg-brand-600 text-white text-lg font-bold disabled:opacity-50 mb-2">
          {saving ? "Menyimpan..." : "Simpan Produk"}
        </button>

        {mode === "edit" && (
          <button onClick={deactivate} disabled={saving} className="btn-tap w-full h-12 rounded-2xl bg-red-50 text-red-600 font-semibold">
            Nonaktifkan Produk
          </button>
        )}
      </div>
    </div>
  );
}

function PriceField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-slate-500">{label}</label>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 rounded-xl border border-slate-200 px-3 mt-1"
      />
    </div>
  );
}
