"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import  AdminLogoutButton from "./AdminLogoutButton";



const NAV = [
  { href: "/catalog", label: "Catalog" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About Us" },
  { href: "/faq", label: "FAQ" },
  { href: "/rate-us", label: "Rate Us" },
];

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function SiteHeader() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  

  const [open, setOpen] = useState(false);

    const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      const y = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const goingDown = y > lastY;
          const delta = Math.abs(y - lastY);

          // ignore tiny scroll jitter
          if (delta > 6) {
            // don't hide at the very top
            if (y < 40) setHidden(false);
            else setHidden(goingDown && !open); // keep visible if menu is open
          }

          lastY = y;
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  // Close the mobile menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // console.log("AdminLogoutButton typeof:", typeof AdminLogoutButton, AdminLogoutButton);


  return (
    <header
  className={classNames(
    "sticky top-0 z-50 border-b bg-white/80 backdrop-blur transition-transform duration-300 will-change-transform",
    hidden ? "-translate-y-full" : "translate-y-0"
  )}
>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Logo size={50} />
          <div className="leading-tight">
            <div className="text-m font-bold tracking-tight text-slate-900">
              Happidoo
            </div>
            <div className="text-xs text-slate-600">
              Delivery • Setup • Safety
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 md:flex">
          {!isAdmin &&
            NAV.map((item) => {
              const active =
                pathname === item.href ||
                pathname?.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={classNames(
                    "text-sm font-medium transition",
                    active
                      ? "text-slate-900"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}

          {isAdmin ? (
            <AdminLogoutButton />
          ) : (
            <Link
              href="/quote"
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Get a Quote
            </Link>
          )}
        </nav>

        {/* Mobile buttons */}
        <div className="flex items-center gap-2 md:hidden">
          {isAdmin ? (
  <AdminLogoutButton />
) : (
  <>
    <Link
      href="/rate-us"
      className="rounded-2xl border px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
    >
      Rate
    </Link>

    <Link
      href="/quote"
      className="rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
    >
      Quote
    </Link>
  </>
)}


          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="rounded-2xl border px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && !isAdmin && (
        <div className="border-t bg-white md:hidden">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <div className="grid gap-2">
              {NAV.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname?.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={classNames(
                      "rounded-2xl px-3 py-2 text-sm font-medium",
                      active
                        ? "bg-slate-900 text-white"
                        : "bg-slate-50 text-slate-900 hover:bg-slate-100"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <Link
                href="/catalog"
                className="rounded-2xl border px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Browse all inflatables
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}