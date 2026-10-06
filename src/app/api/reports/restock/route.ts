import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { classifyRestock } from "@/lib/restock";
import { withOwnerGuard } from "@/lib/owner";

export const GET = withOwnerGuard(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const periodDays = Math.min(Math.max(Number(searchParams.get("days") ?? 30), 1), 180);
  const periodStart = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

  const [products, soldItems] = await Promise.all([
    prisma.product.findMany({ where: { active: true } }),
    prisma.transactionItem.findMany({
      where: { transaction: { createdAt: { gte: periodStart } } },
      select: { productId: true, qty: true },
    }),
  ]);

  const soldQtyByProduct = new Map<string, number>();
  for (const item of soldItems) {
    soldQtyByProduct.set(item.productId, (soldQtyByProduct.get(item.productId) ?? 0) + item.qty);
  }

  const results = products.map((p) =>
    classifyRestock({
      productId: p.id,
      name: p.name,
      unit: p.unit,
      stock: p.stock,
      minStock: p.minStock,
      costPrice: p.costPrice,
      soldQtyPeriod: soldQtyByProduct.get(p.id) ?? 0,
      periodDays,
    })
  );

  const urgent = results.filter((r) => r.status === "URGENT").sort((a, b) => (a.daysOfStockLeft ?? 0) - (b.daysOfStockLeft ?? 0));
  const segera = results.filter((r) => r.status === "SEGERA").sort((a, b) => (a.daysOfStockLeft ?? 0) - (b.daysOfStockLeft ?? 0));
  const stuck = results.filter((r) => r.status === "MACET").sort((a, b) => b.tiedUpCapital - a.tiedUpCapital);
  const idle = results.filter((r) => r.status === "HABIS_TAK_LAKU");
  const healthy = results.filter((r) => r.status === "AMAN");

  return NextResponse.json({ periodDays, urgent, segera, stuck, idle, healthy, all: results });
});
