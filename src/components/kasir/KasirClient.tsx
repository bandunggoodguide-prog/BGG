"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import CustomerTypeSelector from "./CustomerTypeSelector";
import ProductGrid from "./ProductGrid";
import CartSheet from "./CartSheet";
import ScannerModal from "./ScannerModal";
import PaymentModal from "./PaymentModal";
import ReceiptView, { type ReceiptData } from "@/components/ReceiptView";
import { priceForCustomerType } from "@/lib/pricing";
import type { CartItem, CustomerType, Product } from "@/lib/types";

export default function KasirClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerType, setCustomerType] = useState<CustomerType>("UMUM");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadProducts = useCallback(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  // Saat jenis pembeli berubah, harga di keranjang ikut menyesuaikan.
  useEffect(() => {
    setCart((prev) =>
      prev.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return item;
        return { ...item, unitPrice: priceForCustomerType(product, customerType) };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerType]);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["Semua", ...Array.from(set).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (!p.active) return false;
      if (category !== "Semua" && p.category !== category) return false;
      if (q && !p.name.toLowerCase().includes(q) && !(p.barcode ?? "").includes(q)) return false;
      if (!q && category === "Semua" && !p.quickAccess) return false;
      return true;
    });
  }, [products, search, category]);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          setToast(`Stok ${product.name} tidak cukup`);
          return prev;
        }
        return prev.map((i) => (i.productId === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          unit: product.unit,
          icon: product.icon,
          color: product.color,
          qty: 1,
          unitPrice: priceForCustomerType(product, customerType),
          stock: product.stock,
        },
      ];
    });
    setToast(`${product.name} ditambahkan`);
  }

  function handleBarcodeLookup(code: string) {
    const product = products.find((p) => p.barcode === code.trim());
    if (product) {
      addToCart(product);
      setScannerOpen(false);
      setSearch("");
    } else {
      setToast("Barcode tidak dikenali di daftar produk");
    }
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    const match = products.find((p) => p.barcode === search.trim());
    if (match) {
      addToCart(match);
      setSearch("");
    }
  }

  function increment(productId: string) {
    setCart((prev) =>
      prev.map((i) => {
        if (i.productId !== productId) return i;
        if (i.qty >= i.stock) {
          setToast("Stok tidak cukup");
          return i;
        }
        return { ...i, qty: i.qty + 1 };
      })
    );
  }

  function decrement(productId: string) {
    setCart((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0)
    );
  }

  function remove(productId: string) {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }

  const total = cart.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);

  async function confirmPayment(cashReceived: number | null) {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerType,
          cashReceived,
          items: cart.map((i) => ({ productId: i.productId, qty: i.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast(data.error ?? "Gagal menyimpan transaksi");
        return;
      }
      setReceipt(data.transaction);
      setCart([]);
      setPaymentOpen(false);
      loadProducts();
    } catch {
      setToast("Tidak bisa terhubung ke server");
    } finally {
      setSubmitting(false);
    }
  }

  if (receipt) {
    return (
      <div className="max-w-md mx-auto pb-6">
        <div className="text-center mb-4">
          <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-600 text-2xl flex items-center justify-center mx-auto mb-2">
            ✓
          </div>
          <p className="font-bold text-lg">Transaksi Tersimpan</p>
        </div>
        <ReceiptView data={receipt} />
        <button
          onClick={() => setReceipt(null)}
          className="btn-tap w-full h-14 rounded-2xl bg-brand-600 text-white text-lg font-bold mt-4"
        >
          Transaksi Baru
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="mb-3">
        <CustomerTypeSelector value={customerType} onChange={setCustomerType} />
      </div>

      <div className="flex gap-2 mb-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Cari nama produk atau scan barcode..."
          className="flex-1 h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm"
        />
        <button
          onClick={() => setScannerOpen(true)}
          className="btn-tap w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shrink-0"
          aria-label="Scan barcode"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
            <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 12h10" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 -mx-3 px-3">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`btn-tap shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
              category === c ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-slate-400 py-10">Memuat produk...</p>
      ) : (
        <ProductGrid products={filteredProducts} customerType={customerType} onAdd={addToCart} />
      )}

      {toast && (
        <div className="fixed bottom-36 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-medium px-4 py-2 rounded-full z-50 shadow-lg">
          {toast}
        </div>
      )}

      <CartSheet
        items={cart}
        total={total}
        onIncrement={increment}
        onDecrement={decrement}
        onRemove={remove}
        onCheckout={() => setPaymentOpen(true)}
      />

      {scannerOpen && <ScannerModal onDetected={handleBarcodeLookup} onClose={() => setScannerOpen(false)} />}
      {paymentOpen && (
        <PaymentModal
          total={total}
          submitting={submitting}
          onConfirm={confirmPayment}
          onClose={() => setPaymentOpen(false)}
        />
      )}
    </div>
  );
}
