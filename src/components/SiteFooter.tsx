import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-base font-bold text-slate-900">Happidoo</div>
            <p className="mt-2 text-sm text-slate-700">
              Premium inflatables for birthdays, schools, and events. Delivery and setup included.
            </p>
          </div>

          <div className="text-sm">
            <div className="font-semibold text-slate-900">Explore</div>
            <div className="mt-2 grid gap-2 text-slate-700">
              <Link className="hover:text-slate-900" href="/catalog">Catalog</Link>
              <Link className="hover:text-slate-900" href="/gallery">Gallery</Link>
              <Link className="hover:text-slate-900" href="/about">About Us</Link>
              <Link className="hover:text-slate-900" href="/faq">FAQ</Link>
              <Link className="hover:text-slate-900" href="/quote">Get a Quote</Link>
            </div>
          </div>

          <div className="text-sm">
            <div className="font-semibold text-slate-900">Legal</div>
            <div className="mt-2 grid gap-2 text-slate-700">
              <Link className="hover:text-slate-900" href="/terms">Terms</Link>
              <Link className="hover:text-slate-900" href="/privacy">Privacy</Link>
            </div>
          </div>

          <div className="text-sm">
            <div className="font-semibold text-slate-900">Contact</div>
            <div className="mt-2 grid gap-2 text-slate-700">
              <div>Phone: +961 …</div>
              <div>Email: info@…</div>
              <div className="text-xs text-slate-500">
                (Replace with client’s real info)
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-2 border-t pt-6 text-center text-xs text-slate-500">
          <div>© {new Date().getFullYear()} Happidoo. All rights reserved.</div>
          {/* <div className="flex gap-3">
            <span>Built with Next.js</span>
            <span>•</span>
            <span>Mobile-first</span>
          </div> */}
        </div>
      </div>
    </footer>
  );
}
