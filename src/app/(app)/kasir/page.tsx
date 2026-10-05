import { Suspense } from "react";
import KasirClient from "@/components/kasir/KasirClient";

export default function KasirPage() {
  return (
    <Suspense fallback={null}>
      <KasirClient />
    </Suspense>
  );
}
