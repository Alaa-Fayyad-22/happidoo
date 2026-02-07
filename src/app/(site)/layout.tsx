import type { ReactNode } from "react";
import AOSProvider from "@/components/AOSProvider";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen text-slate-900">
      <AOSProvider />

      {/* GLOBAL BACKGROUND — ONLY ONCE for (site) */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0" />

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full blur-3xl opacity-35" />
          <div className="absolute top-16 -right-40 h-[520px] w-[520px] rounded-full blur-3xl opacity-30" />
          <div className="absolute bottom-[-240px] left-1/3 h-[560px] w-[560px] rounded-full blur-3xl opacity-25" />
        </div>
      </div>

      {/* SCROLLING CONTENT */}
      <div className="relative z-0">{children}</div>
    </div>
  );
}
