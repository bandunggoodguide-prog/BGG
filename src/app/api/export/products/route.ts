import { prisma } from "@/lib/prisma";
import { buildCsv, csvResponse } from "@/lib/csv";

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });

  const headers = [
    "Nama Produk",
    "Barcode",
    "Kategori",
    "Satuan",
    "Stok",
    "Stok Minimum",
    "Harga Modal",
    "Harga Satuan",
    "Harga Warung (B2B)",
    "Harga Dus",
    "Status",
  ];

  const rows = products.map((p) => [
    p.name,
    p.barcode ?? "",
    p.category,
    p.unit,
    p.stock,
    p.minStock,
    p.costPrice,
    p.priceRegular,
    p.priceB2B,
    p.priceDus ?? "",
    p.active ? "Aktif" : "Nonaktif",
  ]);

  const csv = buildCsv(headers, rows);
  const stamp = new Date().toISOString().slice(0, 10);
  return csvResponse(`produk-toko-arief-${stamp}.csv`, csv);
}
