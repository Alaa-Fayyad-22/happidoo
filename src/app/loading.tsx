"use client";

import { useEffect } from "react";
import Logo from "@/components/Logo";

export default function Loading() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);
    return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-white">
      <Logo size={250} pulse />
    </div>
  );
}
