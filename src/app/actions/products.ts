"use server";

import { prisma } from "@/lib/prisma";
import { uploadProductImage, deleteProductImage } from "@/lib/storage";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

/**
 * Server Actions are publicly reachable POST endpoints once they are reachable
 * from the module graph, so each one must authorize independently.
 */
async function assertAdmin() {
  const gate = await requireAdmin();
  if (!gate.ok) throw new Error("Unauthorized");
}

// ─── CREATE ───────────────────────────────────────────────────
export async function createProduct(formData: FormData) {
  await assertAdmin();

  const file = formData.get("image") as File | null;
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const category = formData.get("category") as string;
  // ...pull other fields from formData as needed

  let imagePath = "";

  if (file && file.size > 0) {
    imagePath = await uploadProductImage(file, slug);
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      category,
      imagePath,
      // ...other fields
    },
  });

  revalidatePath("/admin/products");
  return product;
}

// ─── UPDATE ───────────────────────────────────────────────────
export async function updateProduct(
  productId: string,
  formData: FormData
) {
  await assertAdmin();

  const file = formData.get("image") as File | null;
  const name = formData.get("name") as string;
  // ...other fields

  // Fetch existing product to get the old imagePath
  const existing = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!existing) throw new Error("Product not found");

  let imagePath = existing.imagePath; // keep old path by default

  // Only replace image if a new file was actually uploaded
  if (file && file.size > 0) {
    await deleteProductImage(existing.imagePath); // delete old from Storage
    imagePath = await uploadProductImage(file, existing.slug); // upload new
  }

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      name,
      imagePath,
      updatedAt: new Date(),
      // ...other fields
    },
  });

  revalidatePath("/admin/products");
  return product;
}

// ─── DELETE ───────────────────────────────────────────────────
export async function deleteProduct(productId: string) {
  await assertAdmin();

  const existing = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!existing) throw new Error("Product not found");

  // Delete file from Storage first, then the DB row
  await deleteProductImage(existing.imagePath);

  await prisma.product.delete({
    where: { id: productId },
  });

  revalidatePath("/admin/products");
}