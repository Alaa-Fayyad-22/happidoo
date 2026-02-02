
import AdminSidebar from "@/components/AdminSidebar";
import Link from "next/link";

export default function AdminHome() {
  return (

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <AdminSidebar />

          <section className="rounded-3xl border bg-white p-6">
            <h1 className="text-2xl font-bold">Admin Overview</h1>
            <p className="mt-2 text-slate-700">
              Manage leads and products. Next step: real authentication + database.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/admin/leads"
                className="rounded-2xl bg-slate-900 px-5 py-3 text-white hover:bg-slate-800"
              >
                View Leads
              </Link>
              <Link
                href="/admin/products"
                className="rounded-2xl border px-5 py-3 hover:bg-slate-50"
              >
                Manage Products
              </Link>
            </div>
          </section>
        </div>
      </main>
  );
}
