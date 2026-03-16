import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";

function getOptimizedImageUrl(url: string, width: number) {
  // Supabase image transform API
  // converts to webp and resizes in one request
  return url.replace(
    "/object/public/",
    `/render/image/public/`
  ) + `?width=${width}&format=webp&quality=80`;
}

export default function ProductCard({ product }: { product: Product }) {
  const src = getOptimizedImageUrl(product.images[0], 800);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group rounded-3xl border bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
        <Image
          src={src}
          alt={product.name}
          width={800}
          height={600}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          fetchPriority="high"
          // loading="lazy"
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