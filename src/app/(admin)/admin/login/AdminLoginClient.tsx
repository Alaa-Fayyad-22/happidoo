"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function AdminLoginClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function signIn() {
    setMsg("");
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setMsg(error.message);
    router.push(next);
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold">Admin Login</h1>
      <p className="mt-2 text-slate-700">Sign in using your admin email.</p>

      <div className="mt-6 rounded-3xl border bg-white p-6">
        <label className="grid gap-1">
          <span className="text-sm font-medium">Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border px-3 py-2"
          />
        </label>

        <label className="mt-4 grid gap-1">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border px-3 py-2"
          />
        </label>

        <button
          onClick={signIn}
          className="mt-5 w-full rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
        >
          Sign in
        </button>

        {msg && (
          <div className="mt-3 rounded-2xl border bg-red-50 p-3 text-sm">
            {msg}
          </div>
        )}
      </div>
    </main>
  );
}
