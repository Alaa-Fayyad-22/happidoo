import type { ReactNode } from "react";
import AOSProvider from "@/components/AOSProvider";


export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen text-slate-900">
      {/* AOS init (client-only component) */}
      <AOSProvider />

      {/* Outdoor sky gradient + playful blobs (global, all pages) */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-sky-50 via-white to-emerald-50" />
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full blur-3xl opacity-35 bg-pink-400" />
        <div className="absolute top-16 -right-40 h-[520px] w-[520px] rounded-full blur-3xl opacity-30 bg-yellow-300" />
        <div className="absolute bottom-[-240px] left-1/3 h-[560px] w-[560px] rounded-full blur-3xl opacity-25 bg-emerald-300" />
      </div>

      {/* Global wrapper spacing */}
      <div className="mx-auto max-w-6xl px-4 md:px-8">{children}</div>
    </div>
  );
}

