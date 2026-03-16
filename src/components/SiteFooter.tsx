import Link from "next/link";

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.859L.054 23.447a.5.5 0 0 0 .606.606l5.588-1.479A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.95 9.95 0 0 1-5.17-1.438l-.361-.214-3.816 1.009 1.01-3.818-.233-.374A9.95 9.95 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export default function SiteFooter() {
  const email = "info@happidoo.org";
  const phone = "96171319079";

  const whatsappMsg = encodeURIComponent(
    "Hi! I'm interested in inflatable game rentals from Happidoo.\nPlease let me know availability and pricing. Thank you!"
  );
  const whatsappUrl = `https://wa.me/${phone}?text=${whatsappMsg}`;

  const socials = [
    { name: "WhatsApp", href: whatsappUrl, icon: WhatsAppIcon },
    { name: "Instagram", href: "https://www.instagram.com/happidoo.lb/", icon: InstagramIcon },
    { name: "TikTok", href: "https://tiktok.com/@happidoo.lb", icon: TikTokIcon },
    { name: "Facebook", href: "https://www.facebook.com/people/Happidoo/61587313028698/", icon: FacebookIcon },
  ];

  return (
    <footer className="relative z-10 border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">

          <div>
            <div className="inline-block text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#00A0E9] to-[#FF8C00] bg-clip-text text-transparent">
              Happidoo
            </div>
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
              <div>
                Phone:{" "}
                <a
                  target="_blank"
                  href={`tel:${phone}`}
                  rel="noopener noreferrer"
                  className="font-medium text-slate-900 underline-offset-4 hover:text-slate-700"
                >
                  +{phone}
                </a>
              </div>
              <div>
                Email:{" "}
                <a
                  target="_blank"
                  href={`mailto:${email}`}
                  rel="noopener noreferrer"
                  className="font-medium text-slate-900 underline-offset-4 hover:text-slate-700"
                >
                  {email}
                </a>
              </div>
            </div>
          </div>

          <div className="text-sm">
            <div className="font-semibold text-slate-900">Socials</div>
            <div className="mt-2 flex flex-wrap gap-2 justify-center">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition"
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>

        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-2 border-t pt-6 text-center text-xs text-slate-500">
          <div>© {new Date().getFullYear()} Happidoo. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}