import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import PenggunaClient from "@/components/pengguna/PenggunaClient";

export default async function PenggunaPage() {
  const session = await getSession();
  if (!session || session.role !== "OWNER") redirect("/kasir");
  return <PenggunaClient />;
}
