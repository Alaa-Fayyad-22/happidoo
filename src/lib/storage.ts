// lib/storage.ts
import { getSupabaseService } from "@/lib/supabase/service";

export async function uploadProductImage(
  file: File,
  slug: string
): Promise<string> {
  const ext = file.name.split(".").pop();
  const filePath = `products/${slug}-${Date.now()}.${ext}`;

  const { error } = await getSupabaseService().storage
    .from("products")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  return filePath; // "products/bouncy-castle-1717000000.jpg"
}

export async function deleteProductImage(imagePath: string): Promise<void> {
  if (!imagePath) return;

  const { error } = await getSupabaseService().storage
    .from("products")
    .remove([imagePath]);

  if (error) throw new Error(`Delete failed: ${error.message}`);
}