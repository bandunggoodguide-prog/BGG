"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      disabled={loading}
      className="btn-tap w-full h-14 rounded-2xl bg-red-50 text-red-600 font-semibold border border-red-100"
    >
      {loading ? "Keluar..." : "Keluar"}
    </button>
  );
}
