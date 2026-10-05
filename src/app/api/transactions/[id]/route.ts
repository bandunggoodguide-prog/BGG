import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const session = await requireApiSession();
    const { id } = await params;
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { items: true, cashier: { select: { name: true } } },
    });
    if (!transaction) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }
    if (session.role === "OWNER") {
      return NextResponse.json({ transaction });
    }
    const { totalCost, ...rest } = transaction;
    return NextResponse.json({
      transaction: { ...rest, totalCost: null, items: transaction.items.map(({ unitCost, ...i }) => i) },
    });
  } catch (err) {
    if (err instanceof ApiAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
