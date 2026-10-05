"use client";

import { getProductEmoji, getColorClass } from "@/lib/icons";
import { formatRupiah } from "@/lib/format";
import { priceForCustomerType } from "@/lib/pricing";
import type { CustomerType, Product } from "@/lib/types";

export default function ProductGrid({
  products,
  customerType,
  onAdd,
}: {
  products: Product[];
  customerType: CustomerType;
  onAdd: (product: Product) => void;
}) {
  if (products.length === 0) {
    return (
      <div className="text-center text-slate-400 text-sm py-10">
        Produk tidak ditemukan. Coba kata kunci lain atau scan barcode.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {products.map((p) => {
        const price = priceForCustomerType(p, customerType);
        const outOfStock = p.stock <= 0;
        return (
          <button
            key={p.id}
            onClick={() => !outOfStock && onAdd(p)}
            disabled={outOfStock}
            className={`btn-tap rounded-2xl border border-slate-200 bg-white p-2 flex flex-col items-center text-center shadow-sm ${
              outOfStock ? "opacity-40" : "active:border-brand-400"
            }`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-1 ${getColorClass(p.color)}`}>
              {getProductEmoji(p.icon)}
            </div>
            <span className="text-xs font-semibold leading-tight line-clamp-2">{p.name}</span>
            <span className="text-[11px] text-brand-700 font-bold mt-0.5">{formatRupiah(price)}</span>
            {outOfStock && <span className="text-[10px] text-red-500 mt-0.5">Stok habis</span>}
          </button>
        );
      })}
    </div>
  );
}
