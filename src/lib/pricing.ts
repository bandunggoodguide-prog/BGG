export type CustomerType = "UMUM" | "B2B";

export type ProductPricing = {
  priceRegular: number;
  priceB2B: number;
};

export function priceForCustomerType(product: ProductPricing, type: CustomerType): number {
  return type === "B2B" ? product.priceB2B : product.priceRegular;
}

export const CUSTOMER_TYPES: { value: CustomerType; label: string; hint: string }[] = [
  { value: "UMUM", label: "Satuan", hint: "Pembeli biasa" },
  { value: "B2B", label: "Warung", hint: "Antar warung" },
];
