"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import InlineScanner from "./InlineScanner";
import { getProductEmoji, getColorClass } from "@/lib/icons";
import { formatRupiah, formatQty } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function CekHargaClient() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [result, setResult] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!notFound) return;
    const t = setTimeout(() => setNotFound(null), 2500);
    return () => clearTimeout(t);
  }, [notFound]);

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => p.name.toLowerCase().includes(q) || (p.barcode ?? "").includes(q)).slice(0, 8);
  }, [products, search]);

  function showProduct(p: Product) {
    setResult(p);
    setNotFound(null);
    setSearch("");
  }

  function handleBarcodeLookup(code: string) {
    const product = products.find((p) => p.barcode === code.trim());
    if (product) {
      showProduct(product);
    } else {
      setNotFound(`Barcode "${code}" tidak ditemukan.`);
    }
  }

  function reset() {
    setResult(null);
    setNotFound(null);
    setSearch("");
  }

  function addToKasir(p: Product) {
    router.push(`/kasir?tambah=${p.id}`);
  }

  if (result) {
    const low = result.stock <= result.minStock;
    return (
      <div className="max-w-md mx-auto">
        <button onClick={reset} className="text-slate-500 text-sm mb-4">
          ← Cek produk lain
        </button>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 text-center shadow-sm">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-3 ${getColorClass(result.color)}`}>
            {getProductEmoji(result.icon)}
          </div>
          <p className="text-xl font-bold">{result.name}</p>
          <p className="text-xs text-slate-400 mb-1">{result.category}</p>
          {result.barcode && <p className="text-[11px] text-slate-300 mb-4">{result.barcode}</p>}

          <div className="space-y-2 mt-4 text-left">
            <PriceRow label="Harga Satuan" value={result.priceRegular} emphasis />
            <PriceRow label="Harga Warung" value={result.priceB2B} />
            {result.priceDus != null && <PriceRow label="Harga Dus/Karton" value={result.priceDus} />}
          </div>

          <div className={`mt-4 text-sm font-semibold ${low ? "text-red-500" : "text-slate-500"}`}>
            Stok: {formatQty(result.stock, result.unit)}
            {low && " · menipis"}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={reset} className="btn-tap flex-1 h-12 rounded-2xl bg-white border border-slate-200 font-semibold text-slate-600">
            Scan Lagi
          </button>
          <button onClick={() => addToKasir(result)} className="btn-tap flex-1 h-12 rounded-2xl bg-brand-600 text-white font-bold">
            Tambah ke Kasir
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto relative">
      <InlineScanner onDetected={handleBarcodeLookup} />

      {notFound && (
        <div className="absolute top-3 left-3 right-3 bg-slate-900/90 text-white text-xs font-medium rounded-full px-4 py-2 text-center z-10">
          {notFound}
        </div>
      )}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Atau ketik nama produk..."
        className="w-full h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm mb-2"
      />

      {loading && <p className="text-center text-slate-400 text-sm py-6">Memuat produk...</p>}

      <div className="space-y-2 pb-4">
        {searchResults.map((p) => (
          <button
            key={p.id}
            onClick={() => showProduct(p)}
            className="btn-tap w-full flex items-center gap-3 bg-white rounded-2xl p-3 border border-slate-100 text-left"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${getColorClass(p.color)}`}>
              {getProductEmoji(p.icon)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{p.name}</p>
              <p className="text-xs text-slate-400">{formatRupiah(p.priceRegular)}</p>
            </div>
          </button>
        ))}
        {search.trim() && !loading && searchResults.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-6">Produk tidak ditemukan.</p>
        )}
      </div>
    </div>
  );
}

function PriceRow({ label, value, emphasis }: { label: string; value: number; emphasis?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-xl px-4 py-3 ${emphasis ? "bg-brand-50" : "bg-slate-50"}`}>
      <span className={`text-sm ${emphasis ? "text-brand-700 font-semibold" : "text-slate-500"}`}>{label}</span>
      <span className={`font-bold ${emphasis ? "text-brand-700 text-xl" : "text-slate-700 text-base"}`}>
        {formatRupiah(value)}
      </span>
    </div>
  );
}
