"use client";

import { formatDateTime, formatRupiah, customerTypeLabel } from "@/lib/format";

export type ReceiptItem = {
  productName: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
};

export type ReceiptData = {
  code: string;
  createdAt: string | Date;
  customerType: string;
  customerNote?: string | null;
  totalAmount: number;
  cashReceived?: number | null;
  changeAmount?: number | null;
  cashier?: { name: string } | null;
  items: ReceiptItem[];
};

function buildWhatsAppText(data: ReceiptData) {
  const lines = [
    `*Struk Belanja - ${data.code}*`,
    formatDateTime(data.createdAt),
    `Jenis: ${customerTypeLabel(data.customerType)}`,
    "",
    ...data.items.map(
      (i) => `${i.productName} x${i.qty} = ${formatRupiah(i.subtotal)}`
    ),
    "",
    `Total: ${formatRupiah(data.totalAmount)}`,
  ];
  if (data.cashReceived != null) {
    lines.push(`Bayar: ${formatRupiah(data.cashReceived)}`);
    lines.push(`Kembali: ${formatRupiah(data.changeAmount ?? 0)}`);
  }
  lines.push("", "Terima kasih sudah belanja 🙏");
  return encodeURIComponent(lines.join("\n"));
}

export default function ReceiptView({ data }: { data: ReceiptData }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-5 font-mono text-sm">
      <div className="text-center mb-3">
        <p className="font-bold text-base">WARUNG KITA</p>
        <p className="text-xs text-slate-500">{data.code}</p>
        <p className="text-xs text-slate-500">{formatDateTime(data.createdAt)}</p>
      </div>
      <div className="flex justify-between text-xs text-slate-600 mb-2 border-b border-dashed border-slate-300 pb-2">
        <span>Kasir: {data.cashier?.name ?? "-"}</span>
        <span>{customerTypeLabel(data.customerType)}</span>
      </div>
      {data.customerNote && <p className="text-xs text-slate-500 mb-2">Catatan: {data.customerNote}</p>}

      <div className="space-y-1.5 mb-3">
        {data.items.map((item, idx) => (
          <div key={idx} className="flex justify-between gap-2">
            <span className="flex-1">
              {item.productName}
              <span className="text-slate-400"> x{item.qty}</span>
            </span>
            <span>{formatRupiah(item.subtotal)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-slate-300 pt-2 space-y-1">
        <div className="flex justify-between font-bold text-base">
          <span>TOTAL</span>
          <span>{formatRupiah(data.totalAmount)}</span>
        </div>
        {data.cashReceived != null && (
          <>
            <div className="flex justify-between text-slate-600">
              <span>Bayar</span>
              <span>{formatRupiah(data.cashReceived)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Kembali</span>
              <span>{formatRupiah(data.changeAmount ?? 0)}</span>
            </div>
          </>
        )}
      </div>

      <a
        href={`https://wa.me/?text=${buildWhatsAppText(data)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-tap mt-4 w-full h-11 rounded-xl bg-green-50 text-green-700 font-sans font-semibold flex items-center justify-center gap-2 text-sm"
      >
        Bagikan ke WhatsApp
      </a>
    </div>
  );
}
