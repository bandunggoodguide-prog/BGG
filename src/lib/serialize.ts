import type { Role } from "@/lib/auth";

export function sanitizeProductForRole<T extends { costPrice: number }>(
  product: T,
  role: Role
): Omit<T, "costPrice"> & { costPrice: number | null } {
  if (role === "OWNER") return product;
  const { costPrice, ...rest } = product;
  return { ...rest, costPrice: null } as Omit<T, "costPrice"> & { costPrice: number | null };
}
