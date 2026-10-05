export type Product = {
  id: string;
  name: string;
  barcode: string | null;
  category: string;
  unit: string;
  icon: string;
  color: string;
  costPrice: number | null;
  priceRegular: number;
  priceB2B: number;
  priceDonation: number;
  stock: number;
  minStock: number;
  quickAccess: boolean;
  active: boolean;
};

export type CartItem = {
  productId: string;
  name: string;
  unit: string;
  icon: string;
  color: string;
  qty: number;
  unitPrice: number;
  stock: number;
};

export type CustomerType = "UMUM" | "B2B" | "DONASI";
