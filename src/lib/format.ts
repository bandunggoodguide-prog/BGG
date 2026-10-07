export function formatRupiah(amount: number): string {
  return "Rp" + Math.round(amount).toLocaleString("id-ID");
}

export function formatQty(qty: number, unit: string): string {
  const rounded = Number.isInteger(qty) ? qty : Math.round(qty * 100) / 100;
  return `${rounded} ${unit}`;
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function customerTypeLabel(type: string): string {
  switch (type) {
    case "B2B":
      return "Warung (B2B)";
    case "DONASI":
      // Transaksi lama dari masa tingkat harga Donasi masih ada (data historis).
      return "Donasi (lama)";
    default:
      return "Satuan";
  }
}
