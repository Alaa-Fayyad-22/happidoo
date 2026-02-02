import Link from "next/link";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group rounded-3xl border bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          loading="lazy"
        />
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-semibold text-slate-900">{product.name}</div>
          <div className="mt-1 text-sm text-slate-600">
            {product.category} • {product.size} • {product.ageRange}
          </div>
        </div>

        <div className="shrink-0 rounded-2xl bg-slate-900 px-3 py-1 text-sm font-semibold text-white">
          from ${product.priceFrom}
        </div>
      </div>
    </Link>
  );
}
