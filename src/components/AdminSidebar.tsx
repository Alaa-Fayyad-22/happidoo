import Link from "next/link";

export default function AdminSidebar() {
  return (
    <aside className="rounded-3xl border bg-white p-4">
      <div className="text-sm font-semibold text-slate-900">Dashboard</div>
      <div className="mt-3 grid gap-2 text-sm">
        <Link className="rounded-2xl bg-slate-50 px-3 py-2 hover:bg-slate-100" href="/admin">
          Overview
        </Link>
        <Link className="rounded-2xl bg-slate-50 px-3 py-2 hover:bg-slate-100" href="/admin/leads">
          Leads
        </Link>
        <Link className="rounded-2xl bg-slate-50 px-3 py-2 hover:bg-slate-100" href="/admin/products">
          Products
        </Link>
        <Link className="rounded-2xl bg-slate-50 px-3 py-2 hover:bg-slate-100" href="/admin/settings">
          Settings
        </Link>
      </div>
    </aside>
  );
}
