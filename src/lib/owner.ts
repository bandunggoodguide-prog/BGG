import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const OWNER_COOKIE = "owner_unlocked";
const COOKIE_DURATION_SECONDS = 60 * 60 * 24 * 180; // 180 hari

function getSigningKey() {
  // OWNER_SECRET dipisah dari OWNER_PIN: PIN pendek & diketik manusia,
  // secret ini panjang & acak, dipakai server untuk menandatangani cookie.
  const secret = process.env.OWNER_SECRET;
  if (!secret) {
    throw new Error("OWNER_SECRET belum diset di environment variables");
  }
  return new TextEncoder().encode(secret);
}

export async function createOwnerToken(): Promise<string> {
  return new SignJWT({ owner: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${COOKIE_DURATION_SECONDS}s`)
    .sign(getSigningKey());
}

export async function verifyOwnerToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSigningKey());
    return payload.owner === true;
  } catch {
    return false;
  }
}

export async function setOwnerCookie() {
  const token = await createOwnerToken();
  const cookieStore = await cookies();
  cookieStore.set(OWNER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_DURATION_SECONDS,
  });
}

export async function clearOwnerCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(OWNER_COOKIE);
}

export async function isOwnerUnlocked(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(OWNER_COOKIE)?.value;
  if (!token) return false;
  return verifyOwnerToken(token);
}

export class OwnerAuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Dipakai di awal route handler API yang hanya boleh diakses pemilik. */
export async function requireOwnerApi(): Promise<void> {
  const unlocked = await isOwnerUnlocked();
  if (!unlocked) {
    throw new OwnerAuthError("Hanya bisa diakses pemilik", 403);
  }
}

/** Bungkus route handler API supaya otomatis menolak akses tanpa cookie pemilik yang sah. */
export function withOwnerGuard<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>
): (...args: Args) => Promise<Response> {
  return async (...args: Args) => {
    try {
      await requireOwnerApi();
      return await handler(...args);
    } catch (err) {
      if (err instanceof OwnerAuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }
  };
}
