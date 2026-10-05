import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "wg_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 hari

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET belum diset di environment variables");
  }
  return new TextEncoder().encode(secret);
}

export type Role = "OWNER" | "EMPLOYEE";

export type SessionPayload = {
  userId: string;
  name: string;
  role: Role;
};

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.userId === "string" &&
      typeof payload.name === "string" &&
      (payload.role === "OWNER" || payload.role === "EMPLOYEE")
    ) {
      return { userId: payload.userId, name: payload.name, role: payload.role };
    }
    return null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export class ApiAuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Dipakai di awal route handler API. Lempar ApiAuthError jika tidak sah. */
export async function requireApiSession(requiredRole?: Role): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new ApiAuthError("Belum login", 401);
  }
  if (requiredRole && session.role !== requiredRole) {
    throw new ApiAuthError("Tidak punya akses", 403);
  }
  return session;
}
