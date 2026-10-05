"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ScannerModal from "@/components/kasir/ScannerModal";
import { getProductEmoji, getColorClass } from "@/lib/icons";
import { formatRupiah, formatQty } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function CekHargaClient() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [result, setResult] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .finally(() => setLoading(false));
  }, []);

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => p.name.toLowerCase().includes(q) || (p.barcode ?? "").includes(q)).slice(0, 8);
  }, [products, search]);

  function showProduct(p: Product) {
    setResult(p);
    setNotFound(null);
    setSearch("");
    setScannerOpen(false);
  }

  function handleBarcodeLookup(code: string) {
    const product = products.find((p) => p.barcode === code.trim());
    if (product) {
      showProduct(product);
    } else {
      setNotFound(`Barcode "${code}" tidak ditemukan di daftar produk.`);
      setScannerOpen(false);
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
            <PriceRow label="Harga Umum" value={result.priceRegular} emphasis />
            <PriceRow label="Harga Grosir (B2B)" value={result.priceB2B} />
            <PriceRow label="Harga Donasi" value={result.priceDonation} />
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
    <div className="max-w-md mx-auto">
      <div className="text-center mb-5">
        <p className="font-bold text-lg">Cek Harga</p>
        <p className="text-sm text-slate-500">Scan barcode atau cari nama produk</p>
      </div>

      <button
        onClick={() => {
          setNotFound(null);
          setScannerOpen(true);
        }}
        className="btn-tap w-full h-32 rounded-3xl bg-brand-600 text-white flex flex-col items-center justify-center gap-2 shadow mb-4"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-10 h-10">
          <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 12h10" strokeLinecap="round" />
        </svg>
        <span className="font-bold">Scan Barcode</span>
      </button>

      {notFound && (
        <div className="bg-amber-50 text-amber-700 text-sm rounded-xl px-4 py-3 mb-4 text-center">{notFound}</div>
      )}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Atau ketik nama produk..."
        className="w-full h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm mb-2"
      />

      {loading && <p className="text-center text-slate-400 text-sm py-6">Memuat produk...</p>}

      <div className="space-y-2">
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

      {scannerOpen && <ScannerModal onDetected={handleBarcodeLookup} onClose={() => setScannerOpen(false)} />}
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
