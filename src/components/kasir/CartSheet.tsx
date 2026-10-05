"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/format";
import { getProductEmoji, getColorClass } from "@/lib/icons";
import type { CartItem } from "@/lib/types";

export default function CartSheet({
  items,
  total,
  onIncrement,
  onDecrement,
  onRemove,
  onCheckout,
}: {
  items: CartItem[];
  total: number;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setOpen(false)} />
      )}

      <div className="fixed left-0 right-0 bottom-16 z-50">
        {open && (
          <div className="bg-white rounded-t-3xl shadow-2xl max-h-[55vh] flex flex-col border-t border-slate-100">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <p className="font-bold">Keranjang ({items.length} jenis)</p>
              <button onClick={() => setOpen(false)} className="text-slate-400 text-sm">
                Tutup
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-4 py-2 no-scrollbar">
              {items.length === 0 && (
                <p className="text-center text-slate-400 text-sm py-8">Keranjang masih kosong</p>
              )}
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-2 py-2.5 border-b border-slate-50 last:border-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0 ${getColorClass(item.color)}`}>
                    {getProductEmoji(item.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatRupiah(item.unitPrice)} / {item.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDecrement(item.productId)}
                      className="btn-tap w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                    <button
                      onClick={() => onIncrement(item.productId)}
                      disabled={item.qty >= item.stock}
                      className="btn-tap w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                  <button onClick={() => onRemove(item.productId)} className="text-red-400 text-xs ml-1 px-1">
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white border-t border-slate-200 px-4 py-3 flex items-center gap-3 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
          <button onClick={() => setOpen((o) => !o)} className="flex-1 text-left btn-tap" disabled={items.length === 0}>
            <p className="text-[11px] text-slate-500">{itemCount} item {open ? "▾" : "▴"}</p>
            <p className="text-lg font-bold text-slate-900">{formatRupiah(total)}</p>
          </button>
          <button
            onClick={onCheckout}
            disabled={items.length === 0}
            className="btn-tap h-12 px-6 rounded-2xl bg-brand-600 text-white font-bold disabled:opacity-40 disabled:pointer-events-none shadow"
          >
            Bayar
          </button>
        </div>
      </div>
    </>
  );
}
