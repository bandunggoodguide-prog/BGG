import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LaporanClient from "@/components/laporan/LaporanClient";

export default async function LaporanPage() {
  const session = await getSession();
  if (!session || session.role !== "OWNER") redirect("/kasir");
  return <LaporanClient />;
}
