import { NextRequest, NextResponse } from "next/server";
import { setOwnerCookie } from "@/lib/owner";

export async function POST(request: NextRequest) {
  const ownerPin = process.env.OWNER_PIN;
  if (!ownerPin) {
    return NextResponse.json(
      { error: "OWNER_PIN belum diset di server. Tambahkan di Environment Variables lalu deploy ulang." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const pin = typeof body?.pin === "string" ? body.pin : null;

  if (!pin) {
    return NextResponse.json({ error: "Masukkan PIN" }, { status: 400 });
  }
  if (pin !== ownerPin) {
    return NextResponse.json({ error: "PIN salah" }, { status: 401 });
  }

  await setOwnerCookie();
  return NextResponse.json({ ok: true });
}
