import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import RiwayatClient from "@/components/riwayat/RiwayatClient";

export default async function RiwayatPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <RiwayatClient role={session.role} />;
}
