import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import ProdukClient from "@/components/produk/ProdukClient";

export default async function ProdukPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <ProdukClient role={session.role} />;
}
