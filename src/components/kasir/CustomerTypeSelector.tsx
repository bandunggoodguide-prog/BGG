"use client";

import type { CustomerType } from "@/lib/types";

const OPTIONS: { value: CustomerType; label: string; hint: string; emoji: string }[] = [
  { value: "UMUM", label: "Umum", hint: "Pembeli biasa", emoji: "🧑" },
  { value: "B2B", label: "Grosir", hint: "Antar warung", emoji: "🏪" },
  { value: "DONASI", label: "Donasi", hint: "Harga spesial", emoji: "❤️" },
];

const ACTIVE_CLASS: Record<CustomerType, string> = {
  UMUM: "border-blue-500 bg-blue-50 text-blue-700",
  B2B: "border-green-500 bg-green-50 text-green-700",
  DONASI: "border-pink-500 bg-pink-50 text-pink-700",
};

export default function CustomerTypeSelector({
  value,
  onChange,
}: {
  value: CustomerType;
  onChange: (v: CustomerType) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`btn-tap rounded-2xl border-2 py-2.5 flex flex-col items-center gap-0.5 ${
              active ? ACTIVE_CLASS[opt.value] : "border-slate-200 bg-white text-slate-500"
            }`}
          >
            <span className="text-xl">{opt.emoji}</span>
            <span className="text-sm font-bold leading-tight">{opt.label}</span>
            <span className="text-[10px] leading-tight opacity-80">{opt.hint}</span>
          </button>
        );
      })}
    </div>
  );
}
