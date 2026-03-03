"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import  AdminLogoutButton from "./AdminLogoutButton";
import { useRef } from "react";




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

  
const headerRef = useRef<HTMLElement | null>(null);
const [headerHeight, setHeaderHeight] = useState(0);


  useEffect(() => {
  function updateHeight() {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }

  updateHeight();
  window.addEventListener("resize", updateHeight);
  return () => window.removeEventListener("resize", updateHeight);
}, []);


  

  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

    const [hidden, setHidden] = useState(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Smooth close with animation
  function closeMenu() {
    setIsClosing(true);
    setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
    }, 300); // matches animation duration
  }

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
    if (open) closeMenu();
  }, [pathname]);

  // Close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) closeMenu();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // console.log("AdminLogoutButton typeof:", typeof AdminLogoutButton, AdminLogoutButton);


  return (
    <header
    ref={headerRef}
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
    {/* <Link
      href="/rate-us"
      className="rounded-2xl border px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
    >
      Rate
    </Link> */}

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
  aria-label="Toggle menu"
  aria-expanded={open}
  onClick={() => setOpen((v) => !v)}
  className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white transition hover:bg-slate-50"
>
  <span className="sr-only">Toggle menu</span>

  <span
    className={classNames(
      "absolute h-0.5 w-5 bg-slate-900 transition-all duration-300",
      open ? "rotate-45" : "-translate-y-1.5"
    )}
  />
  <span
    className={classNames(
      "absolute h-0.5 w-5 bg-slate-900 transition-all duration-300",
      open ? "opacity-0" : "opacity-100"
    )}
  />
  <span
    className={classNames(
      "absolute h-0.5 w-5 bg-slate-900 transition-all duration-300",
      open ? "-rotate-45" : "translate-y-1.5"
    )}
  />
</button>

        </div>
      </div>

      {/* Mobile menu panel */}
     {open && !isAdmin && (
  <div
  className="fixed left-0 right-0 bottom-0 z-[150] md:hidden"
  style={{ top: headerHeight }}
>
    {/* Backdrop with colorful gradient blur */}
    <div
      className={classNames(
        "absolute inset-0 bg-gradient-to-br from-[#FF8C00]/20 via-purple-500/10 to-blue-500/10 backdrop-blur-lg transition-transform duration-300 transition-opacity duration-300",
        isClosing ? "opacity-0" : "opacity-100",
        isClosing ? "animate-[slideUp_0.5s_ease-in]" : "animate-[slideDown_0.3s_ease-out]"
      )}
      onClick={closeMenu}
    />

    {/* Menu panel with bouncy animation */}
    <div 
      className={classNames(
        "absolute top-0 left-0 right-0 bg-white shadow-2xl transition-transform duration-300",
        isClosing ? "animate-[slideUp_0.5s_ease-in]" : "animate-[slideDown_0.3s_ease-out]"
      )}
      style={{
        borderBottomLeftRadius: '2rem',
        borderBottomRightRadius: '2rem',
      }}
    >
      {/* Nav links with playful styling */}
      <div className="mx-auto max-w-6xl px-4 pb-8 pt-2">
        <div className="grid gap-3">
          {NAV.map((item, idx) => {
            const active =
              pathname === item.href ||
              pathname?.startsWith(item.href + "/");
              
            // Fun gradient colors for each item
            const gradients = [
              "from-blue-500 to-cyan-500",
              "from-purple-500 to-pink-500",
              "from-green-500 to-emerald-500",
              "from-yellow-500 to-orange-500",
              "from-red-500 to-rose-500",
            ];

            return (
              <Link
                key={item.href}
                href={item.href}
                className={classNames(
                  "group relative overflow-hidden rounded-3xl px-6 py-4 text-lg font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-md",
                  active
                    ? `bg-gradient-to-r ${gradients[idx % gradients.length]} text-white shadow-lg`
                    : "bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 hover:shadow-xl"
                )}
                style={{
                  animationDelay: `${idx * 50}ms`,
                }}
              >
                {/* Shimmer effect on hover */}
                {!active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                )}
                
                <span className="relative flex items-center justify-between">
                  {item.label}
                  <span className="text-2xl group-hover:scale-125 transition-transform">
                    {active ? "🎈" : "→"}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>

    {/* Keyframes for slide animations */}
    <style jsx>{`
      @keyframes slideDown {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      @keyframes slideUp {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(-100%);
          opacity: 0;
        }
      }
    `}</style>
  </div>
)}
    </header>
  );
}