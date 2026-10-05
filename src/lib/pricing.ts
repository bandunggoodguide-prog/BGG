export type CustomerType = "UMUM" | "B2B" | "DONASI";

export type ProductPricing = {
  priceRegular: number;
  priceB2B: number;
  priceDonation: number;
};

export function priceForCustomerType(product: ProductPricing, type: CustomerType): number {
  switch (type) {
    case "B2B":
      return product.priceB2B;
    case "DONASI":
      return product.priceDonation;
    default:
      return product.priceRegular;
  }
}

export const CUSTOMER_TYPES: { value: CustomerType; label: string; hint: string }[] = [
  { value: "UMUM", label: "Umum", hint: "Pembeli biasa" },
  { value: "B2B", label: "Grosir", hint: "Antar warung" },
  { value: "DONASI", label: "Donasi", hint: "Harga spesial" },
];
