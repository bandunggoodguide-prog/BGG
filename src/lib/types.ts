export type Product = {
  id: string;
  name: string;
  barcode: string | null;
  category: string;
  unit: string;
  icon: string;
  color: string;
  costPrice: number;
  priceRegular: number;
  priceB2B: number;
  priceDus: number | null;
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

export type CustomerType = "UMUM" | "B2B";
