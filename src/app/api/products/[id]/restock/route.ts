import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const qty = Number(body.qty);

  if (!Number.isFinite(qty) || qty <= 0) {
    return NextResponse.json({ error: "Jumlah stok tidak valid" }, { status: 400 });
  }

  const [product] = await prisma.$transaction([
    prisma.product.update({
      where: { id },
      data: { stock: { increment: qty } },
    }),
    prisma.stockMovement.create({
      data: {
        productId: id,
        type: "RESTOCK",
        qty,
        note: body.note ? String(body.note) : "Stok masuk",
      },
    }),
  ]);

  return NextResponse.json({ product });
}
