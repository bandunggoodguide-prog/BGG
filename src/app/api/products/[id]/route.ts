import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiSession } from "@/lib/auth";
import { sanitizeProductForRole } from "@/lib/serialize";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const session = await requireApiSession();
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ product: sanitizeProductForRole(product, session.role) });
  } catch (err) {
    if (err instanceof ApiAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await requireApiSession("OWNER");
    const { id } = await params;
    const body = await request.json();

    const barcodeRaw = body.barcode !== undefined ? String(body.barcode ?? "").trim() : undefined;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: String(body.name).trim() } : {}),
        ...(barcodeRaw !== undefined ? { barcode: barcodeRaw || null } : {}),
        ...(body.category !== undefined ? { category: String(body.category) } : {}),
        ...(body.unit !== undefined ? { unit: String(body.unit) } : {}),
        ...(body.icon !== undefined ? { icon: String(body.icon) } : {}),
        ...(body.color !== undefined ? { color: String(body.color) } : {}),
        ...(body.costPrice !== undefined ? { costPrice: Number(body.costPrice) } : {}),
        ...(body.priceRegular !== undefined ? { priceRegular: Number(body.priceRegular) } : {}),
        ...(body.priceB2B !== undefined ? { priceB2B: Number(body.priceB2B) } : {}),
        ...(body.priceDonation !== undefined ? { priceDonation: Number(body.priceDonation) } : {}),
        ...(body.minStock !== undefined ? { minStock: Number(body.minStock) } : {}),
        ...(body.stock !== undefined ? { stock: Number(body.stock) } : {}),
        ...(body.quickAccess !== undefined ? { quickAccess: Boolean(body.quickAccess) } : {}),
        ...(body.active !== undefined ? { active: Boolean(body.active) } : {}),
      },
    });

    return NextResponse.json({ product });
  } catch (err) {
    if (err instanceof ApiAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "Barcode sudah dipakai produk lain" }, { status: 409 });
    }
    throw err;
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireApiSession("OWNER");
    const { id } = await params;
    await prisma.product.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ApiAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
