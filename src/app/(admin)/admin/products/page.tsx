// src/app/(admin)/admin/products/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";

type Product = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  slug: string;
  category: string;
  priceFrom: number | null;
  size: string;
  features: string;
  description: string;
  imagePath: string;
  isActive: boolean;
  sortOrder: number;
};

type ProductFormState = {
  id?: string;
  name: string;
  category: string;
  priceFrom: string; // keep as string in UI
  size: string;
  features: string;
  description: string;
  imagePath: string;
  isActive: boolean;
};

function emptyForm(): ProductFormState {
  return {
    name: "",
    category: "general",
    priceFrom: "",
    size: "",
    features: "",
    description: "",
    imagePath: "",
    isActive: true,
  };
}

async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data?.ok) {
    throw new Error(data?.details || data?.message || `Upload failed (${res.status})`);
  }

  return data.path as string; // ✅ this is what goes into Product.imagePath
}


async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      "Content-Type": init?.body instanceof FormData ? undefined : "application/json",
    } as any,
  });

  // If 403 due to proxy protection, you’ll get redirected by proxy on page routes,
  // but API calls should still be blocked. Show a clean error.
  if (!res.ok) {
    let payload: any = null;
    try {
      payload = await res.json();
    } catch {
      // ignore
    }
    const msg = payload?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return res.json();
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Signed URL cache: imagePath -> signedURL
  const [signedUrlMap, setSignedUrlMap] = useState<Record<string, string>>({});

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ProductFormState>(emptyForm());
  const [formError, setFormError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const sortedProducts = useMemo(() => {
    const copy = [...products];
    copy.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      // createdAt desc fallback:
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return copy;
  }, [products]);

  async function loadProducts() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchJSON<{ products: Product[] }>("/api/admin/products", { method: "GET" });
      setProducts(data.products);
    } catch (e: any) {
      setError(e?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  // Fetch signed url for any imagePath we haven't signed yet
  async function ensureSignedUrl(path: string) {
  const p = (path || "").trim();
  if (!p) return;

  // ✅ ignore bad legacy values (Windows paths)
  if (p.includes(":\\") || p.startsWith("C:\\")) return;

    if (signedUrlMap[p]) return;

    try {
      const data = await fetchJSON<{ url: string }>(
        `/api/image/product?path=${encodeURIComponent(p)}`,
        { method: "GET" }
      );
      setSignedUrlMap((prev) => ({ ...prev, [p]: data.url }));
    } catch {
      // Ignore signing errors; UI will show placeholder
    }
  }

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // sign all current product images (best effort)
    (async () => {
      for (const p of products) {
        if (p.imagePath) await ensureSignedUrl(p.imagePath);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  function openAdd() {
    setForm(emptyForm());
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setForm({
      id: p.id,
      name: p.name,
      category: p.category || "general",
      priceFrom: p.priceFrom === null || p.priceFrom === undefined ? "" : String(p.priceFrom),
      size: p.size || "",
      features: p.features || "",
      description: p.description || "",
      imagePath: p.imagePath || "",
      isActive: !!p.isActive,
    });
    setFormError("");
    setModalOpen(true);
    if (p.imagePath) ensureSignedUrl(p.imagePath);
  }

  function closeModal() {
    setModalOpen(false);
    setFormError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleUpload(file: File) {
  setBusy(true);
  setFormError("");
  try {
    const path = await uploadImage(file); // ✅ use the helper that understands ok/details

    // ✅ never allow Windows paths to be stored
    if (path.includes(":\\") || path.startsWith("C:\\")) {
      throw new Error("Upload returned an invalid path. Expected a Supabase storage path.");
    }

    setForm((prev) => ({ ...prev, imagePath: path }));
    await ensureSignedUrl(path);
  } catch (e: any) {
    setFormError(e?.message || "Image upload failed");
  } finally {
    setBusy(false);
  }
}

  async function saveProduct() {
    setBusy(true);
    setFormError("");

    const name = form.name.trim();
    if (!name) {
      setFormError("Name is required.");
      setBusy(false);
      return;
    }

    const priceFrom =
      form.priceFrom.trim() === "" ? null : Number.parseInt(form.priceFrom.trim(), 10);

    if (form.priceFrom.trim() !== "" && (!Number.isFinite(priceFrom) || (priceFrom ?? 0) < 0)) {
      setFormError("Price must be a valid non-negative number (or empty).");
      setBusy(false);
      return;
    }

    const payload = {
      name,
      category: form.category.trim() || "general",
      priceFrom,
      size: form.size.trim(),
      features: form.features.trim(),
      description: form.description.trim(),
      imagePath: form.imagePath.trim(),
      isActive: form.isActive,
    };

    try {
    if (payload.imagePath.includes(":\\") || payload.imagePath.startsWith("C:\\")) {
      payload.imagePath = "";
    }

      if (form.id) {
        await fetchJSON(`/api/admin/products/${encodeURIComponent(form.id)}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await fetchJSON(`/api/admin/products`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      closeModal();
      await loadProducts();
    } catch (e: any) {
      setFormError(e?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function deleteProduct(p: Product) {
    const ok = window.confirm(`Delete "${p.name}"? This cannot be undone.`);
    if (!ok) return;

    setBusy(true);
    setError("");
    try {
      await fetchJSON(`/api/admin/products/${encodeURIComponent(p.id)}`, { method: "DELETE" });
      await loadProducts();
    } catch (e: any) {
      setError(e?.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(p: Product) {
    setBusy(true);
    setError("");
    try {
      await fetchJSON(`/api/admin/products/${encodeURIComponent(p.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !p.isActive }),
      });
      await loadProducts();
    } catch (e: any) {
      setError(e?.message || "Update failed");
    } finally {
      setBusy(false);
    }
  }

  // async function moveIndex(fromIdx: number, toIdx: number) {
  //   if (toIdx < 0 || toIdx >= sortedProducts.length) return;

  //   const next = [...sortedProducts];
  //   const [item] = next.splice(fromIdx, 1);
  //   next.splice(toIdx, 0, item);

  //   // Call reorder endpoint with ordered IDs
  //   setBusy(true);
  //   setError("");
  //   try {
  //     await fetchJSON("/api/admin/products/reorder", {
  //       method: "POST",
  //       body: JSON.stringify({ orderedIds: next.map((x) => x.id) }),
  //     });
  //     await loadProducts();
  //   } catch (e: any) {
  //     setError(e?.message || "Reorder failed");
  //   } finally {
  //     setBusy(false);
  //   }
  // }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            <AdminSidebar />
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      
      <div className="flex items-center justify-between gap-4">
        
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-sm text-gray-500">
            Manage catalog items, images, activation, and ordering.
          </p>
        </div>

        <button
          onClick={openAdd}
          disabled={busy}
          className="px-4 py-2 rounded-md bg-black text-white disabled:opacity-50"
        >
          + Add Product
        </button>
      </div>

      {error ? (
        <div className="mt-4 p-3 rounded-md bg-red-50 text-red-700 border border-red-100">
          {error}
        </div>
      ) : null}

      <div className="mt-6 rounded-lg border bg-white overflow-hidden">
        {loading ? (
          <div className="p-6 text-gray-600">Loading…</div>
        ) : sortedProducts.length === 0 ? (
          <div className="p-6 text-gray-600">No products yet. Add your first one.</div>
        ) : (
          <div className="divide-y">
            {sortedProducts.map((p, idx) => {
              const imgUrl = p.imagePath ? signedUrlMap[p.imagePath] : "";
              return (
                <div key={p.id} className="p-4 flex items-center gap-4">
                  
                  <div className="w-20 h-16 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                    {imgUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imgUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-400">No image</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-medium truncate">{p.name}</div>
                      <span className="text-xs px-2 py-0.5 rounded-full border text-gray-600">
                        {p.category || "general"}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${
                          p.isActive
                            ? "bg-green-50 text-green-700 border-green-100"
                            : "bg-gray-50 text-gray-600 border-gray-100"
                        }`}
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      <span>Slug: <span className="font-mono text-xs">{p.slug}</span></span>
                      <span>
                        Price from:{" "}
                        <span className="font-medium">
                          {p.priceFrom === null ? "—" : `$${p.priceFrom}`}
                        </span>
                      </span>
                      <span>Order: <span className="font-medium">{p.sortOrder}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* <button
                      className="px-2 py-1 rounded-md border text-sm disabled:opacity-50"
                      onClick={() => moveIndex(idx, idx - 1)}
                      disabled={busy || idx === 0}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      className="px-2 py-1 rounded-md border text-sm disabled:opacity-50"
                      onClick={() => moveIndex(idx, idx + 1)}
                      disabled={busy || idx === sortedProducts.length - 1}
                      title="Move down"
                    >
                      ↓
                    </button> */}

                    <button
                      className="px-3 py-1 rounded-md border text-sm disabled:opacity-50"
                      onClick={() => toggleActive(p)}
                      disabled={busy}
                    >
                      Toggle
                    </button>

                    <button
                      className="px-3 py-1 rounded-md border text-sm disabled:opacity-50"
                      onClick={() => openEdit(p)}
                      disabled={busy}
                    >
                      Edit
                    </button>

                    <button
                      className="px-3 py-1 rounded-md border text-sm text-red-600 disabled:opacity-50"
                      onClick={() => deleteProduct(p)}
                      disabled={busy}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white border shadow-lg">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="font-semibold">
                {form.id ? "Edit Product" : "Add Product"}
              </div>
              <button
                onClick={closeModal}
                disabled={busy}
                className="px-2 py-1 rounded-md border disabled:opacity-50"
              >
                Close
              </button>
            </div>

            <div className="p-4 space-y-4">
              {formError ? (
                <div className="p-3 rounded-md bg-red-50 text-red-700 border border-red-100">
                  {formError}
                </div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <div className="text-sm font-medium mb-1">Name *</div>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-md border"
                    placeholder="e.g. Mega Slide"
                    disabled={busy}
                  />
                </label>

                <label className="block">
                  <div className="text-sm font-medium mb-1">Category</div>
                  <input
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-md border"
                    placeholder="slides, bouncers, obstacles..."
                    disabled={busy}
                  />
                </label>

                <label className="block">
                  <div className="text-sm font-medium mb-1">Price From</div>
                  <input
                    value={form.priceFrom}
                    onChange={(e) => setForm((p) => ({ ...p, priceFrom: e.target.value }))}
                    className="w-full px-3 py-2 rounded-md border"
                    placeholder="e.g. 250"
                    disabled={busy}
                    inputMode="numeric"
                  />
                </label>

                <label className="block">
                  <div className="text-sm font-medium mb-1">Size</div>
                  <input
                    value={form.size}
                    onChange={(e) => setForm((p) => ({ ...p, size: e.target.value }))}
                    className="w-full px-3 py-2 rounded-md border"
                    placeholder="e.g. 6m x 3m"
                    disabled={busy}
                  />
                </label>
              </div>

              <label className="block">
                <div className="text-sm font-medium mb-1">Features</div>
                <textarea
                  value={form.features}
                  onChange={(e) => setForm((p) => ({ ...p, features: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md border"
                  placeholder="Wet/Dry, Safety net, etc."
                  disabled={busy}
                  rows={3}
                />
              </label>

              <label className="block">
                <div className="text-sm font-medium mb-1">Description</div>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md border"
                  placeholder="Short marketing description"
                  disabled={busy}
                  rows={4}
                />
              </label>

              <div className="flex items-start gap-4">
                <div className="w-28 h-20 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                  {form.imagePath && signedUrlMap[form.imagePath] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={signedUrlMap[form.imagePath]}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">No image</span>
                  )}
                </div>

                <div className="flex-1">
                  <div className="text-sm font-medium mb-1">Image</div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      disabled={busy}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUpload(f);
                      }}
                    />
                    {form.imagePath ? (
                      <span className="text-xs text-gray-600 break-all">
                        {form.imagePath}
                      </span>
                    ) : null}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Uploads to private storage. Public site uses signed URLs.
                  </div>
                </div>
              </div>

              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  disabled={busy}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                />
                <span className="text-sm">Active (visible on public catalog)</span>
              </label>
            </div>

            <div className="p-4 border-t flex items-center justify-end gap-2">
              <button
                onClick={closeModal}
                disabled={busy}
                className="px-4 py-2 rounded-md border disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveProduct}
                disabled={busy}
                className="px-4 py-2 rounded-md bg-black text-white disabled:opacity-50"
              >
                {busy ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
    </div>
    </main>
  );
}
