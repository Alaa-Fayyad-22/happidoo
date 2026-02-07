import Link from "next/link";
import Logo from "@/components/Logo";
import { FaWhatsapp, FaInstagram, FaTiktok, FaFacebook } from "react-icons/fa";



export default function SiteFooter() {
  const email = "info@happidoo.org"
  const phone = "96171319079"

  const whatsappMsg = encodeURIComponent("Hi! I’m interested in inflatable game rentals from Happidoo.\nPlease let me know availability and pricing. Thank you!");
const whatsappUrl = `https://wa.me/${phone}?text=${whatsappMsg}`;

const socials = [
  { name: "WhatsApp", href: whatsappUrl, icon: FaWhatsapp },
  { name: "Instagram", href: "https://www.instagram.com/happidoo.lb/", icon: FaInstagram },
  { name: "TikTok", href: "https://tiktok.com/@happidoo.lb", icon: FaTiktok },
  { name: "Facebook", href: "https://www.facebook.com/people/Happidoo/61587313028698/", icon: FaFacebook },
];

  return (
    <footer className="relative z-10 border-t bg-white">
      
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div>
             
            <div className="inline-block text-2xl sm:text-3xl font-extrabold tracking-tight  bg-gradient-to-r from-[#00A0E9] to-[#FF8C00] bg-clip-text text-transparent">
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
              {/* <div>Phone: +96171319079</div> */}
              <div>Phone: +{""}<a target="_blank"
              href={`tel:${phone}`}
              rel="noopener noreferrer"
              className="font-medium text-slate-900 underline-offset-4 hover:text-slate-700"
            >
              {phone}
            </a></div>
              <div>Email: {" "} <a target="_blank"
              href={`mailto:${email}`}
              rel="noopener noreferrer"
              className="font-medium text-slate-900 underline-offset-4 hover:text-slate-700"
            >
              {email}
            </a></div>
            </div>
          </div>

          <div className="text-sm">
            <div className="font-semibold  text-slate-900">Socials</div>

            <div className="mt-2 flex flex-wrap gap-2 justify-center">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    area-label={s.name}
                    className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition"
                  >
                    <Icon className="text-base" />
                  </a>
                );
              })}
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
