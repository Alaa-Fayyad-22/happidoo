"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

// For testing: 360 seconds = 6 minutes
// For 1 hour use: 60 * 60 * 1000
const IDLE_MS = 600 * 1000;
const KEY = "admin_last_activity_ms";

function isTrackedAdminPath(pathname: string) {
  return pathname.startsWith("/admin/products") || pathname.startsWith("/admin/leads");
}

export default function AdminLogoutButton() {
  const pathname = usePathname() || "/admin";
  const router = useRouter();

  const supabase = useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  useEffect(() => {
    if (!isTrackedAdminPath(pathname)) return;

    const touch = () => {
      try {
        localStorage.setItem(KEY, String(Date.now()));
      } catch {
        // ignore
      }
    };

    const logoutToLogin = async () => {
      await supabase.auth.signOut();
      const next = encodeURIComponent(pathname || "/admin");
      router.replace(`/admin/login?next=${next}`);
    };

    const maybeLogoutIfIdle = async () => {
      let last = 0;
      try {
        const lastRaw = localStorage.getItem(KEY);
        last = lastRaw ? Number(lastRaw) : 0;
      } catch {
        return;
      }

      if (!last) {
        touch();
        return;
      }

      if (Date.now() - last > IDLE_MS) {
        await logoutToLogin();
      }
    };

    // On enter: check & start
    (async () => {
      await maybeLogoutIfIdle();
      touch();
    })();

    const events = ["click", "keydown", "mousemove", "scroll", "touchstart"];
    const onActivity = () => touch();
    events.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));

    const interval = window.setInterval(maybeLogoutIfIdle, 30_000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, onActivity));
      window.clearInterval(interval);
    };
  }, [pathname, router, supabase]);

  return (
    <button
      type="button"
      className="rounded-xl bg-black/5 px-4 py-2 text-sm font-semibold hover:bg-black/10"
      onClick={async () => {
        await supabase.auth.signOut();
        const next = encodeURIComponent(pathname || "/admin");
        router.replace(`/admin/login?next=${next}`);
      }}
    >
      Logout
    </button>
  );
}
