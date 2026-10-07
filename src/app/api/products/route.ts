import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category")?.trim();
  const onlyActive = searchParams.get("all") !== "1";

  const products = await prisma.product.findMany({
    where: {
      ...(onlyActive ? { active: true } : {}),
      ...(category ? { category } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { barcode: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "Nama produk wajib diisi" }, { status: 400 });
    }
    const priceRegular = Number(body.priceRegular);
    const priceB2B = Number(body.priceB2B);
    const costPrice = Number(body.costPrice ?? 0);
    if (![priceRegular, priceB2B, costPrice].every((n) => Number.isFinite(n) && n >= 0)) {
      return NextResponse.json({ error: "Harga tidak valid" }, { status: 400 });
    }
    const priceDusRaw = body.priceDus;
    const priceDus =
      priceDusRaw === null || priceDusRaw === undefined || priceDusRaw === ""
        ? null
        : Number(priceDusRaw);
    if (priceDus !== null && !(Number.isFinite(priceDus) && priceDus >= 0)) {
      return NextResponse.json({ error: "Harga Dus tidak valid" }, { status: 400 });
    }

    const barcodeRaw = body.barcode ? String(body.barcode).trim() : "";

    const product = await prisma.product.create({
      data: {
        name,
        barcode: barcodeRaw || null,
        category: String(body.category ?? "Lainnya"),
        unit: String(body.unit ?? "pcs"),
        icon: String(body.icon ?? "package"),
        color: String(body.color ?? "slate"),
        costPrice,
        priceRegular,
        priceB2B,
        priceDus,
        stock: Number(body.stock ?? 0),
        minStock: Number(body.minStock ?? 5),
        quickAccess: Boolean(body.quickAccess ?? true),
      },
    });

    if (product.stock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: "RESTOCK",
          qty: product.stock,
          note: "Stok awal saat produk dibuat",
        },
      });
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "Barcode sudah dipakai produk lain" }, { status: 409 });
    }
    throw err;
  }
}
