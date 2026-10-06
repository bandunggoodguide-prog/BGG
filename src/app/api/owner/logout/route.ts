import { NextResponse } from "next/server";
import { clearOwnerCookie } from "@/lib/owner";

export async function POST() {
  await clearOwnerCookie();
  return NextResponse.json({ ok: true });
}
