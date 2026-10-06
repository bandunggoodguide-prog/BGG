import { NextResponse } from "next/server";
import { isOwnerUnlocked } from "@/lib/owner";

export async function GET() {
  const unlocked = await isOwnerUnlocked();
  return NextResponse.json({ unlocked });
}
