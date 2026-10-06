import { Suspense } from "react";
import OwnerLoginClient from "@/components/OwnerLoginClient";

export default function OwnerLoginPage() {
  return (
    <Suspense fallback={null}>
      <OwnerLoginClient />
    </Suspense>
  );
}
