import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function isAdminEmail(email: string | null | undefined) {
  const allow = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);

  return !!email && allow.includes(email.toLowerCase());
}

export default async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isLoginPage = pathname.startsWith("/admin/login");

  // Only guard admin pages + admin APIs
  if (!isAdminRoute && !isAdminApi) return res;

  // Allow login page to load
  if (isLoginPage) return res;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  // Not logged in
  if (!user) {
    if (isAdminApi) {
      // IMPORTANT: return JSON (do not redirect to HTML)
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // // Logged in, but not allowed admin email
  // if (!isAdminEmail(user.email)) {
  //   if (isAdminApi) {
  //     return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  //   }
  //   // For pages, redirect away (or you could show a 403 page)
  //   const url = req.nextUrl.clone();
  //   url.pathname = "/";
  //   return NextResponse.redirect(url);
  // }

  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
