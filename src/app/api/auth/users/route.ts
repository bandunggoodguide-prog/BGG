import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Daftar nama user aktif untuk pemilihan di layar login (tanpa data sensitif).
export async function GET() {
  const users = await prisma.user.findMany({
    where: { active: true },
    select: { id: true, name: true, role: true },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ users });
}
