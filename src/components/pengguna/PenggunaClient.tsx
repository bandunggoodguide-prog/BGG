"use client";

import { useCallback, useEffect, useState } from "react";

type UserRow = { id: string; name: string; role: "OWNER" | "EMPLOYEE"; active: boolean; createdAt: string };

export default function PenggunaClient() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<UserRow | "new" | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="pb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="font-bold text-lg">Pengguna</p>
        <button
          onClick={() => setEditing("new")}
          className="btn-tap w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center text-xl font-bold"
        >
          +
        </button>
      </div>

      {loading && <p className="text-center text-slate-400 py-10">Memuat...</p>}

      <div className="space-y-2">
        {users.map((u) => (
          <button
            key={u.id}
            onClick={() => setEditing(u)}
            className="btn-tap w-full flex items-center gap-3 bg-white rounded-2xl p-3 border border-slate-100 text-left"
          >
            <div className="w-11 h-11 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center">
              {u.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{u.name}</p>
              <p className="text-xs text-slate-400">{u.role === "OWNER" ? "Pemilik" : "Pegawai"}</p>
            </div>
            {!u.active && <span className="text-[10px] bg-red-50 text-red-500 px-2 py-1 rounded-full">Nonaktif</span>}
          </button>
        ))}
      </div>

      {editing && (
        <UserFormModal
          user={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function UserFormModal({
  user,
  onClose,
  onSaved,
}: {
  user: UserRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(user?.name ?? "");
  const [role, setRole] = useState<"OWNER" | "EMPLOYEE">(user?.role ?? "EMPLOYEE");
  const [pin, setPin] = useState("");
  const [active, setActive] = useState(user?.active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(user ? `/api/users/${user.id}` : "/api/users", {
        method: user ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, pin: pin || undefined, active }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan");
        return;
      }
      onSaved();
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-end">
      <div className="bg-white w-full rounded-t-3xl px-5 pt-5 pb-8">
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold text-lg">{user ? "Edit Pengguna" : "Tambah Pengguna"}</p>
          <button onClick={onClose} className="text-slate-400 text-sm">Tutup</button>
        </div>

        <label className="text-xs font-semibold text-slate-500">Nama</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-12 rounded-xl border border-slate-200 px-3 mb-3 mt-1" />

        <label className="text-xs font-semibold text-slate-500">Peran</label>
        <div className="flex gap-2 mb-3 mt-1">
          <button
            onClick={() => setRole("EMPLOYEE")}
            className={`flex-1 h-11 rounded-xl text-sm font-semibold border ${role === "EMPLOYEE" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200"}`}
          >
            Pegawai
          </button>
          <button
            onClick={() => setRole("OWNER")}
            className={`flex-1 h-11 rounded-xl text-sm font-semibold border ${role === "OWNER" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200"}`}
          >
            Pemilik
          </button>
        </div>

        <label className="text-xs font-semibold text-slate-500">{user ? "PIN baru (kosongkan jika tidak diubah)" : "PIN (4-6 digit angka)"}</label>
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          maxLength={6}
          className="w-full h-12 rounded-xl border border-slate-200 px-3 mb-3 mt-1 tracking-widest"
        />

        {user && (
          <label className="flex items-center gap-2 mb-4">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-5 h-5" />
            <span className="text-sm">Akun aktif (bisa login)</span>
          </label>
        )}

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <button
          onClick={save}
          disabled={saving || !name || (!user && pin.length < 4)}
          className="btn-tap w-full h-14 rounded-2xl bg-brand-600 text-white text-lg font-bold disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </div>
  );
}
