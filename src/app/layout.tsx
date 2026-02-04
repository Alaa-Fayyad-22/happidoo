import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Analytics } from "@vercel/analytics/next";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata: Metadata = {
  // <meta name="google-site-verification" content="GjFGs0_kz2ar_60uUIaatcH-Dw3qeETrU4Z6UCOfhoE" />
  verification: {
    google: "GjFGs0_kz2ar_60uUIaatcH-Dw3qeETrU4Z6UCOfhoE",
  },
  title: {
    default: "Inflatables Rentals",
    template: "%s • Inflatables Rentals",
  },
  description: "Inflatables rentals for birthdays and events. Delivery and setup included.",
  metadataBase: new URL("https://happidoo.vercel.app"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        <SiteHeader />
        <div className="min-h-[calc(100vh-80px)]">{children}</div>
        <SiteFooter />
        <WhatsAppButton />

        {/* Vercel Web Analytics */}
        <Analytics />
      </body>
    </html>
  );
}
