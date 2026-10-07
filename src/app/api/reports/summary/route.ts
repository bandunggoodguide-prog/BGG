import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withOwnerGuard } from "@/lib/owner";

function parseRange(searchParams: URLSearchParams) {
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const to = toParam ? new Date(toParam) : new Date();
  const from = fromParam ? new Date(fromParam) : new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
  return { from, to };
}

export const GET = withOwnerGuard(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const { from, to } = parseRange(searchParams);

  const transactions = await prisma.transaction.findMany({
    where: { createdAt: { gte: from, lte: to } },
    include: { items: true },
  });

  let totalAmount = 0;
  let totalCost = 0;
  const byType: Record<string, { count: number; totalAmount: number; totalCost: number }> = {
    UMUM: { count: 0, totalAmount: 0, totalCost: 0 },
    B2B: { count: 0, totalAmount: 0, totalCost: 0 },
  };

  const soldQtyByProduct = new Map<string, { qty: number; revenue: number; name: string }>();

  for (const t of transactions) {
    totalAmount += t.totalAmount;
    totalCost += t.totalCost;
    const bucket = byType[t.customerType] ?? (byType[t.customerType] = { count: 0, totalAmount: 0, totalCost: 0 });
    bucket.count += 1;
    bucket.totalAmount += t.totalAmount;
    bucket.totalCost += t.totalCost;

    for (const item of t.items) {
      const entry = soldQtyByProduct.get(item.productId) ?? { qty: 0, revenue: 0, name: item.productName };
      entry.qty += item.qty;
      entry.revenue += item.subtotal;
      soldQtyByProduct.set(item.productId, entry);
    }
  }

  const bestSellers = Array.from(soldQtyByProduct.entries())
    .map(([productId, v]) => ({ productId, ...v }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);

  return NextResponse.json({
    range: { from, to },
    totalAmount,
    totalCost,
    profit: totalAmount - totalCost,
    transactionCount: transactions.length,
    byType,
    bestSellers,
  });
});
