import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OwnerAuthError, requireOwnerApi } from "@/lib/owner";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await requireOwnerApi();
    const { id } = await params;
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!transaction) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ transaction });
  } catch (err) {
    if (err instanceof OwnerAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
