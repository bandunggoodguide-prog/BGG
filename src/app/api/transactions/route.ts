import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiSession } from "@/lib/auth";
import { priceForCustomerType, type CustomerType } from "@/lib/pricing";

async function generateCode(): Promise<string> {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const countToday = await prisma.transaction.count({ where: { createdAt: { gte: startOfDay } } });
  return `GRS-${datePart}-${String(countToday + 1).padStart(4, "0")}`;
}

type CartItemInput = { productId: string; qty: number };

export async function POST(request: NextRequest) {
  try {
    const session = await requireApiSession();
    const body = await request.json();

    const customerType = String(body.customerType ?? "UMUM") as CustomerType;
    if (!["UMUM", "B2B", "DONASI"].includes(customerType)) {
      return NextResponse.json({ error: "Jenis pembeli tidak valid" }, { status: 400 });
    }

    const rawItems: CartItemInput[] = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length === 0) {
      return NextResponse.json({ error: "Keranjang masih kosong" }, { status: 400 });
    }

    const productIds = rawItems.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    let totalAmount = 0;
    let totalCost = 0;
    const itemsToCreate: {
      productId: string;
      productName: string;
      qty: number;
      unitPrice: number;
      unitCost: number;
      subtotal: number;
    }[] = [];

    for (const raw of rawItems) {
      const product = productMap.get(raw.productId);
      const qty = Number(raw.qty);
      if (!product || !Number.isFinite(qty) || qty <= 0) {
        return NextResponse.json({ error: "Item keranjang tidak valid" }, { status: 400 });
      }
      if (product.stock < qty) {
        return NextResponse.json(
          { error: `Stok ${product.name} tidak cukup (sisa ${product.stock} ${product.unit})` },
          { status: 409 }
        );
      }
      const unitPrice = priceForCustomerType(product, customerType);
      const unitCost = product.costPrice;
      const subtotal = Math.round(unitPrice * qty);
      totalAmount += subtotal;
      totalCost += Math.round(unitCost * qty);
      itemsToCreate.push({ productId: product.id, productName: product.name, qty, unitPrice, unitCost, subtotal });
    }

    const cashReceived = body.cashReceived !== undefined && body.cashReceived !== null ? Number(body.cashReceived) : null;
    const changeAmount = cashReceived !== null ? Math.round(cashReceived - totalAmount) : null;
    const code = await generateCode();

    const transaction = await prisma.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          code,
          cashierId: session.userId,
          customerType,
          customerNote: body.customerNote ? String(body.customerNote).trim() : null,
          totalAmount,
          totalCost,
          cashReceived,
          changeAmount,
          items: { create: itemsToCreate },
        },
        include: { items: true, cashier: { select: { name: true } } },
      });

      for (const item of itemsToCreate) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.qty } },
        });
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: "SALE",
            qty: -item.qty,
            note: `Transaksi ${created.code}`,
            userId: session.userId,
          },
        });
      }

      return created;
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (err) {
    if (err instanceof ApiAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireApiSession();
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200);

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
      include: { items: true, cashier: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const shaped = transactions.map((t) => {
      if (session.role === "OWNER") return t;
      // sembunyikan info keuntungan/modal dari pegawai
      const { totalCost, ...rest } = t;
      return { ...rest, totalCost: null, items: t.items.map(({ unitCost, ...i }) => i) };
    });

    return NextResponse.json({ transactions: shaped });
  } catch (err) {
    if (err instanceof ApiAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
