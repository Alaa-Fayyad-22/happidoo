// src/app/(admin)/admin/testimonials/page.tsx
import AdminSidebar from "@/components/AdminSidebar";
import { prisma } from "@/lib/prisma";
import TestimonialsAdminClient from "./testimonialsAdminClient";

export default async function AdminTestimonialsPage() {
  const rawItems = await prisma.testimonial.findMany({
    where: {
      isApproved: false,
      isHidden: false,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const items = rawItems.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(), // ✅ key line
  }));

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <AdminSidebar />

        <div className="p-4 md:p-8">
          <h1 className="text-2xl font-semibold">Testimonials</h1>
          <p className="mt-1 text-sm text-gray-500">
            Approve testimonials before they appear on the website.
          </p>

          <div className="mt-6">
            <TestimonialsAdminClient initialItems={items} />
          </div>
        </div>
      </div>
    </main>
  );
}
