import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCsv, parseRupiah, parseQty } from "@/lib/csv";

export const maxDuration = 60;

type FieldKey =
  | "name"
  | "barcode"
  | "category"
  | "unit"
  | "stock"
  | "minStock"
  | "costPrice"
  | "priceRegular"
  | "priceB2B"
  | "priceDus"
  | "status";

const HEADER_ALIASES: Record<FieldKey, string[]> = {
  name: ["nama produk", "nama", "product name", "name"],
  barcode: ["barcode", "kode barcode", "kode"],
  category: ["kategori", "category"],
  unit: ["satuan", "unit"],
  stock: ["stok", "stock", "jumlah stok"],
  minStock: ["stok minimum", "minimum stok", "min stock", "stok min"],
  costPrice: ["harga modal", "modal", "cost price", "harga beli"],
  priceRegular: ["harga satuan", "harga umum", "harga jual", "harga", "price", "harga eceran"],
  priceB2B: ["harga warung (b2b)", "harga grosir (b2b)", "harga warung", "harga grosir", "harga b2b", "harga antar warung"],
  priceDus: ["harga dus", "harga dus/karton", "harga karton", "harga per dus"],
  status: ["status"],
};

function mapHeaders(headerRow: string[]): Partial<Record<FieldKey, number>> {
  const map: Partial<Record<FieldKey, number>> = {};
  const normalized = headerRow.map((h) => h.trim().toLowerCase());
  for (const [field, aliases] of Object.entries(HEADER_ALIASES) as [FieldKey, string[]][]) {
    const idx = normalized.findIndex((h) => aliases.includes(h));
    if (idx !== -1) map[field] = idx;
  }
  return map;
}

type ParsedRow = {
  rowNumber: number;
  name: string;
  barcode: string | null;
  category: string;
  unit: string;
  stock: number;
  minStock: number;
  costPrice: number;
  priceRegular: number;
  priceB2B: number;
  priceDus: number | null;
  active: boolean;
};

type RowError = { row: number; name: string; reason: string };

export async function POST(request: NextRequest) {
  const csvText = await request.text();
  if (!csvText.trim()) {
    return NextResponse.json({ error: "File kosong" }, { status: 400 });
  }

  const table = parseCsv(csvText);
  if (table.length < 2) {
    return NextResponse.json({ error: "Tidak ada baris data di file ini" }, { status: 400 });
  }

  const headers = mapHeaders(table[0]);
  if (headers.name === undefined) {
    return NextResponse.json(
      { error: 'Kolom "Nama Produk" tidak ditemukan. Gunakan format yang sama dengan hasil Unduh Produk.' },
      { status: 400 }
    );
  }
  if (headers.priceRegular === undefined) {
    return NextResponse.json(
      { error: 'Kolom "Harga Umum" (harga jual) tidak ditemukan. Gunakan format yang sama dengan hasil Unduh Produk.' },
      { status: 400 }
    );
  }

  const cell = (row: string[], field: FieldKey) => {
    const idx = headers[field];
    return idx === undefined ? "" : (row[idx] ?? "").trim();
  };

  const errors: RowError[] = [];
  const parsedByKey = new Map<string, ParsedRow>();

  for (let i = 1; i < table.length; i++) {
    const row = table[i];
    const rowNumber = i + 1; // nomor baris termasuk header, biar cocok dibuka di Excel
    const name = cell(row, "name");
    if (!name) {
      errors.push({ row: rowNumber, name: "(tanpa nama)", reason: "Nama produk kosong" });
      continue;
    }

    const priceRegular = parseRupiah(cell(row, "priceRegular"));
    if (priceRegular === null) {
      errors.push({ row: rowNumber, name, reason: "Harga Umum tidak valid/kosong" });
      continue;
    }

    const barcodeRaw = cell(row, "barcode");
    const statusRaw = cell(row, "status").toLowerCase();

    const parsed: ParsedRow = {
      rowNumber,
      name,
      barcode: barcodeRaw || null,
      category: cell(row, "category") || "Lainnya",
      unit: cell(row, "unit") || "pcs",
      stock: parseQty(cell(row, "stock")) ?? 0,
      minStock: parseQty(cell(row, "minStock")) ?? 5,
      costPrice: parseRupiah(cell(row, "costPrice")) ?? 0,
      priceRegular,
      priceB2B: parseRupiah(cell(row, "priceB2B")) ?? priceRegular,
      priceDus: parseRupiah(cell(row, "priceDus")),
      active: statusRaw ? statusRaw !== "nonaktif" : true,
    };

    // Baris dengan barcode/nama sama di file yang sama: yang terakhir menang.
    const key = parsed.barcode ? `b:${parsed.barcode}` : `n:${parsed.name.toLowerCase()}`;
    parsedByKey.set(key, parsed);
  }

  const existing = await prisma.product.findMany({ select: { id: true, name: true, barcode: true } });
  const byBarcode = new Map(existing.filter((p) => p.barcode).map((p) => [p.barcode as string, p.id]));
  const byNameLower = new Map(existing.map((p) => [p.name.toLowerCase(), p.id]));

  const toCreate: ParsedRow[] = [];
  const toUpdate: { id: string; row: ParsedRow }[] = [];

  for (const row of parsedByKey.values()) {
    const matchId = (row.barcode && byBarcode.get(row.barcode)) || byNameLower.get(row.name.toLowerCase());
    if (matchId) {
      toUpdate.push({ id: matchId, row });
    } else {
      toCreate.push(row);
    }
  }

  let created = 0;
  let updated = 0;
  const CHUNK_SIZE = 50;

  function productData(row: ParsedRow) {
    return {
      name: row.name,
      barcode: row.barcode,
      category: row.category,
      unit: row.unit,
      stock: row.stock,
      minStock: row.minStock,
      costPrice: row.costPrice,
      priceRegular: row.priceRegular,
      priceB2B: row.priceB2B,
      priceDus: row.priceDus,
      active: row.active,
    };
  }

  for (let i = 0; i < toCreate.length; i += CHUNK_SIZE) {
    const chunk = toCreate.slice(i, i + CHUNK_SIZE);
    const results = await Promise.allSettled(
      chunk.map((row) => prisma.product.create({ data: productData(row) }))
    );
    results.forEach((r, idx) => {
      if (r.status === "fulfilled") created++;
      else errors.push({ row: chunk[idx].rowNumber, name: chunk[idx].name, reason: "Gagal menyimpan ke database" });
    });
  }

  for (let i = 0; i < toUpdate.length; i += CHUNK_SIZE) {
    const chunk = toUpdate.slice(i, i + CHUNK_SIZE);
    const results = await Promise.allSettled(
      chunk.map(({ id, row }) => prisma.product.update({ where: { id }, data: productData(row) }))
    );
    results.forEach((r, idx) => {
      if (r.status === "fulfilled") updated++;
      else errors.push({ row: chunk[idx].row.rowNumber, name: chunk[idx].row.name, reason: "Gagal menyimpan ke database" });
    });
  }

  return NextResponse.json({
    totalRows: table.length - 1,
    created,
    updated,
    errorCount: errors.length,
    errors: errors.slice(0, 50),
  });
}
