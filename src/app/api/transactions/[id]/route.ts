import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!transaction) {
    return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json({ transaction });
}
