export type RestockStatus = "URGENT" | "SEGERA" | "AMAN" | "MACET" | "HABIS_TAK_LAKU";

export type RestockInput = {
  productId: string;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  costPrice: number;
  soldQtyPeriod: number; // total qty terjual dalam periode analisa (default 30 hari)
  periodDays: number;
};

export type RestockResult = RestockInput & {
  velocityPerDay: number;
  daysOfStockLeft: number | null; // null = tak terbatas (tidak ada penjualan)
  status: RestockStatus;
  suggestedRestockQty: number;
  tiedUpCapital: number; // modal yang mengendap di stok barang ini
};

const TARGET_STOCK_DAYS = 14;

export function classifyRestock(input: RestockInput): RestockResult {
  const velocityPerDay = input.periodDays > 0 ? input.soldQtyPeriod / input.periodDays : 0;
  const daysOfStockLeft = velocityPerDay > 0 ? input.stock / velocityPerDay : null;
  const tiedUpCapital = input.stock * input.costPrice;

  let status: RestockStatus;
  let suggestedRestockQty = 0;

  if (velocityPerDay > 0) {
    if (input.stock <= 0 || (daysOfStockLeft !== null && daysOfStockLeft <= 3)) {
      status = "URGENT";
    } else if (daysOfStockLeft !== null && daysOfStockLeft <= 7) {
      status = "SEGERA";
    } else {
      status = "AMAN";
    }
    const targetStock = velocityPerDay * TARGET_STOCK_DAYS;
    suggestedRestockQty = Math.max(0, Math.ceil(targetStock - input.stock));
  } else {
    // tidak ada penjualan sama sekali dalam periode
    if (input.stock > 0) {
      status = "MACET"; // stuck, uang mengendap
    } else {
      status = "HABIS_TAK_LAKU"; // kosong & memang tidak laku, pertimbangkan jangan restock
    }
    if (input.stock < input.minStock && status !== "MACET") {
      suggestedRestockQty = Math.max(0, input.minStock - input.stock);
    }
  }

  return { ...input, velocityPerDay, daysOfStockLeft, status, suggestedRestockQty, tiedUpCapital };
}

export const RESTOCK_STATUS_LABEL: Record<RestockStatus, string> = {
  URGENT: "Mendesak - segera restock",
  SEGERA: "Segera restock",
  AMAN: "Stok aman",
  MACET: "Stuck - tidak gerak",
  HABIS_TAK_LAKU: "Habis & kurang laku",
};
