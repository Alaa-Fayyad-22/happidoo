export default function Gallery() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md">
        <div className="mb-4 text-5xl">🎈</div>

        <h1 className="text-3xl font-extrabold text-[#FF8C00] tracking-tight">
          Gallery coming soon
        </h1>

        <p className="mt-3 text-lg text-slate-600">
          We’re putting together real photos from our events so you can see the
          inflatables in action.
        </p>

        <p className="mt-2 text-m text-slate-500">
          In the meantime, browse our inflatables and request a quote anytime.
        </p>

        <a
          href="/catalog"
          className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#FF8C00] px-6 py-3 text-sm font-semibold text-white hover:bg-[#FF7C00] transition"
        >
          Browse inflatables
        </a>
      </div>
    </main>
  );
}
