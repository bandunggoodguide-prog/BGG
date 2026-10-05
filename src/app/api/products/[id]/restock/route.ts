import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

// Owner & pegawai boleh mencatat kedatangan stok baru (barang masuk).
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await requireApiSession();
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
          userId: session.userId,
        },
      }),
    ]);

    return NextResponse.json({ product });
  } catch (err) {
    if (err instanceof ApiAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
