import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiSession } from "@/lib/auth";

export async function GET() {
  try {
    await requireApiSession("OWNER");
    const users = await prisma.user.findMany({
      select: { id: true, name: true, role: true, active: true, createdAt: true },
      orderBy: [{ active: "desc" }, { name: "asc" }],
    });
    return NextResponse.json({ users });
  } catch (err) {
    if (err instanceof ApiAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireApiSession("OWNER");
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const pin = String(body.pin ?? "").trim();
    const role = body.role === "OWNER" ? "OWNER" : "EMPLOYEE";

    if (!name) return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
    if (!/^\d{4,6}$/.test(pin)) {
      return NextResponse.json({ error: "PIN harus 4-6 digit angka" }, { status: 400 });
    }

    const pinHash = await bcrypt.hash(pin, 10);
    const user = await prisma.user.create({
      data: { name, pinHash, role },
      select: { id: true, name: true, role: true, active: true, createdAt: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    if (err instanceof ApiAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
