
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminSettings() {
  return (
    
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <AdminSidebar />
          <section className="rounded-3xl border border-white/60 bg-white/70 backdrop-blur shadow-xl shadow-black/5"
>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="mt-2 text-slate-700">
              Next step: business info, delivery zones, pricing rules.
            </p>
          </section>
        </div>
      </main>
    
  );
}
