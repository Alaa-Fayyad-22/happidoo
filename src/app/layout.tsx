import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: {
    default: "Inflatables Rentals",
    template: "%s • Inflatables Rentals",
  },
  description: "Inflatables rentals for birthdays and events. Delivery and setup included.",
  metadataBase: new URL("https://happidoo.vercel.app/"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        <SiteHeader />
        <div className="min-h-[calc(100vh-80px)]">{children}</div>
        <SiteFooter />

        {/* Vercel Web Analytics */}
        <Analytics />
      </body>
    </html>
  );
}
