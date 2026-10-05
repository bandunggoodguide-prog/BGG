import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ApiAuthError, requireApiSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await requireApiSession("OWNER");
    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.role !== undefined) data.role = body.role === "OWNER" ? "OWNER" : "EMPLOYEE";
    if (body.active !== undefined) data.active = Boolean(body.active);
    if (body.pin !== undefined && String(body.pin).trim() !== "") {
      const pin = String(body.pin).trim();
      if (!/^\d{4,6}$/.test(pin)) {
        return NextResponse.json({ error: "PIN harus 4-6 digit angka" }, { status: 400 });
      }
      data.pinHash = await bcrypt.hash(pin, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, role: true, active: true, createdAt: true },
    });

    return NextResponse.json({ user });
  } catch (err) {
    if (err instanceof ApiAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
