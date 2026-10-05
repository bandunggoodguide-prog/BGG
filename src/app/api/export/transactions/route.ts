import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildCsv, csvResponse } from "@/lib/csv";
import { customerTypeLabel } from "@/lib/format";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const transactions = await prisma.transaction.findMany({
    where: {
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });

  const headers = [
    "Tanggal",
    "Kode Transaksi",
    "Jenis Pembeli",
    "Catatan",
    "Produk",
    "Qty",
    "Harga Jual Satuan",
    "Modal Satuan",
    "Subtotal",
    "Keuntungan Item",
    "Total Transaksi",
    "Uang Diterima",
    "Kembalian",
  ];

  const rows: (string | number)[][] = [];
  for (const t of transactions) {
    for (const item of t.items) {
      rows.push([
        t.createdAt.toISOString(),
        t.code,
        customerTypeLabel(t.customerType),
        t.customerNote ?? "",
        item.productName,
        item.qty,
        item.unitPrice,
        item.unitCost,
        item.subtotal,
        Math.round((item.unitPrice - item.unitCost) * item.qty),
        t.totalAmount,
        t.cashReceived ?? "",
        t.changeAmount ?? "",
      ]);
    }
  }

  const csv = buildCsv(headers, rows);
  const stamp = new Date().toISOString().slice(0, 10);
  return csvResponse(`transaksi-toko-arief-${stamp}.csv`, csv);
}
