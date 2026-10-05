import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const userId = typeof body?.userId === "string" ? body.userId : null;
  const pin = typeof body?.pin === "string" ? body.pin : null;

  if (!userId || !pin) {
    return NextResponse.json({ error: "Pilih nama dan masukkan PIN" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.active) {
    return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
  }

  const valid = await bcrypt.compare(pin, user.pinHash);
  if (!valid) {
    return NextResponse.json({ error: "PIN salah" }, { status: 401 });
  }

  await setSessionCookie({ userId: user.id, name: user.name, role: user.role as "OWNER" | "EMPLOYEE" });

  return NextResponse.json({ ok: true, role: user.role });
}
