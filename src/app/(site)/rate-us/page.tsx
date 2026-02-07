import RateUsForm from "./rateUsFormClient";

export const metadata = {
  title: "Rate Us | Happidoo",
};

export default function RateUsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Rate us ⭐</h1>
      <p className="mt-2 text-slate-600">
        Give a quick rating. If you want, leave a short testimonial too.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <RateUsForm />
      </div>
    </main>
  );
}
