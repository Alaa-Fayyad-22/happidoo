"use client";

import { useEffect, useState } from "react";

const KEY = "admin_ok_v1";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false);
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setOk(localStorage.getItem(KEY) === "1");
  }, []);

  async function login() {
    setMsg("");
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    const data = (await res.json()) as { ok: boolean; message?: string };
    if (res.ok && data.ok) {
      localStorage.setItem(KEY, "1");
      setOk(true);
      setPw("");
      return;
    }
    setMsg(data?.message || "Login failed");
  }

  function logout() {
    localStorage.removeItem(KEY);
    setOk(false);
  }

  if (!ok) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <p className="mt-2 text-slate-700">Enter the admin password to access the dashboard.</p>

        <div className="mt-6 rounded-3xl border bg-white p-6">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full rounded-xl border px-3 py-2"
              placeholder="••••••••"
            />
          </label>

          <button
            onClick={login}
            className="mt-4 w-full rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
          >
            Sign in
          </button>

          {msg && <div className="mt-3 rounded-2xl border bg-red-50 p-3 text-sm">{msg}</div>}
        </div>
      </main>
    );
  }

  return (
    <>
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="text-sm font-semibold text-slate-900">Admin</div>
          <button
            onClick={logout}
            className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </div>
      {children}
    </>
  );
}
