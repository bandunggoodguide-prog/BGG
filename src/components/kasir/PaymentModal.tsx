"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/format";
import NumPad from "@/components/NumPad";

export default function PaymentModal({
  total,
  submitting,
  onConfirm,
  onClose,
}: {
  total: number;
  submitting: boolean;
  onConfirm: (cashReceived: number | null) => void;
  onClose: () => void;
}) {
  const [digits, setDigits] = useState("");
  const cashReceived = digits ? Number(digits) : 0;
  const change = cashReceived - total;

  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-end">
      <div className="bg-white w-full rounded-t-3xl px-5 pt-5 pb-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold text-lg">Pembayaran</p>
          <button onClick={onClose} className="text-slate-400 text-sm">
            Batal
          </button>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 text-center mb-4">
          <p className="text-xs text-slate-500">Total Belanja</p>
          <p className="text-3xl font-extrabold text-slate-900">{formatRupiah(total)}</p>
        </div>

        <p className="text-xs text-slate-500 mb-1">Uang diterima</p>
        <div className="bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 mb-2 text-right text-2xl font-bold">
          {digits ? formatRupiah(cashReceived) : <span className="text-slate-300">Rp0</span>}
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setDigits(String(total))}
            className="btn-tap flex-1 h-10 rounded-xl bg-brand-50 text-brand-700 text-sm font-semibold"
          >
            Uang Pas
          </button>
          <button
            onClick={() => setDigits("")}
            className="btn-tap h-10 px-4 rounded-xl bg-slate-100 text-slate-500 text-sm font-semibold"
          >
            Hapus
          </button>
        </div>

        <NumPad value={digits} onChange={setDigits} maxLength={9} />

        <div className="flex items-center justify-between mt-5 mb-4 px-1">
          <p className="text-sm text-slate-500">Kembalian</p>
          <p className={`text-xl font-bold ${change < 0 ? "text-red-500" : "text-brand-700"}`}>
            {formatRupiah(change)}
          </p>
        </div>

        <button
          onClick={() => onConfirm(digits ? cashReceived : null)}
          disabled={submitting}
          className="btn-tap w-full h-14 rounded-2xl bg-brand-600 text-white text-lg font-bold disabled:opacity-50"
        >
          {submitting ? "Menyimpan..." : "Selesai & Simpan"}
        </button>
        {change < 0 && digits && (
          <p className="text-center text-xs text-amber-600 mt-2">
            Uang diterima kurang dari total. Transaksi tetap bisa disimpan (misal: dicatat utang/nyicil).
          </p>
        )}
      </div>
    </div>
  );
}
