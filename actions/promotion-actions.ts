"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { promotionFormSchema } from "@/lib/schemas/promotionSchema";

// --- 1. GET ALL PROMOTIONS ---
export async function getPromotionsAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

// --- 2. CREATE PROMOTION ---
export async function createPromotion(formData: FormData) {
  const supabase = await createClient();

  // Parse Data
  const rawData = {
    title: formData.get("title"),
    description: formData.get("description"),
    badge_text: formData.get("badge_text"),
    link_url: formData.get("link_url"),
    is_active: formData.get("is_active") === "true", // Convert string "true" to boolean
    start_date: new Date(formData.get("start_date") as string),
    end_date: new Date(formData.get("end_date") as string),
  };

  // Validasi
  const validated = promotionFormSchema.safeParse({
    ...rawData,
    image_file: undefined,
  });
  if (!validated.success)
    return { error: "Data tidak valid. Periksa input Anda." };

  // Upload Image (Wajib untuk Create)
  const imageFile = formData.get("image_file") as File;
  let image_url = "";

  if (imageFile && imageFile.size > 0) {
    const fileName = `${Date.now()}-${imageFile.name.replaceAll(" ", "_")}`;
    const { error: uploadError } = await supabase.storage
      .from("banners")
      .upload(fileName, imageFile);
    if (uploadError)
      return { error: "Upload gambar gagal: " + uploadError.message };

    const { data } = supabase.storage.from("banners").getPublicUrl(fileName);
    image_url = data.publicUrl;
  } else {
    return { error: "Gambar wajib diupload untuk promo baru!" };
  }

  // Insert DB
  const { error } = await supabase.from("promotions").insert({
    ...validated.data,
    link_url: validated.data.link_url || null,
    image_url: image_url,
    start_date: validated.data.start_date.toISOString(),
    end_date: validated.data.end_date.toISOString(),
  });

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/dashboard/promotions");
  return { success: true };
}

// --- 3. UPDATE PROMOTION (FULL UPDATE) ---
export async function updatePromotion(id: string, formData: FormData) {
  const supabase = await createClient();

  // Parse Data
  const rawData = {
    title: formData.get("title"),
    description: formData.get("description"),
    badge_text: formData.get("badge_text"),
    link_url: formData.get("link_url"),
    is_active: formData.get("is_active") === "true", // Ini penting! ambil status dari form
    start_date: new Date(formData.get("start_date") as string),
    end_date: new Date(formData.get("end_date") as string),
  };

  // Validasi
  const validated = promotionFormSchema.safeParse({
    ...rawData,
    image_file: undefined,
  });
  if (!validated.success) return { error: "Data tidak valid." };

  // Logic Image: User upload baru atau tetap pakai lama?
  const imageFile = formData.get("image_file") as File;
  const oldImageUrl = formData.get("old_image_url") as string;
  let finalImageUrl = oldImageUrl;

  if (imageFile && imageFile.size > 0) {
    // 1. Upload Baru
    const fileName = `${Date.now()}-${imageFile.name.replaceAll(" ", "_")}`;
    const { error: uploadError } = await supabase.storage
      .from("banners")
      .upload(fileName, imageFile);
    if (uploadError) return { error: "Gagal upload gambar update." };

    const { data } = supabase.storage.from("banners").getPublicUrl(fileName);
    finalImageUrl = data.publicUrl;

    // 2. Hapus Lama (Opsional, biar bersih)
    if (oldImageUrl) {
      const oldName = oldImageUrl.split("/").pop();
      if (oldName) await supabase.storage.from("banners").remove([oldName]);
    }
  }

  // Update DB
  const { error } = await supabase
    .from("promotions")
    .update({
      ...validated.data,
      link_url: validated.data.link_url || null,
      image_url: finalImageUrl, // Pakai URL baru atau lama
      start_date: validated.data.start_date.toISOString(),
      end_date: validated.data.end_date.toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/dashboard/promotions");
  return { success: true };
}

// --- 4. DELETE PROMOTION ---
export async function deletePromotion(id: string, imageUrl: string) {
  const supabase = await createClient();

  if (imageUrl) {
    const fileName = imageUrl.split("/").pop();
    if (fileName) await supabase.storage.from("banners").remove([fileName]);
  }

  const { error } = await supabase.from("promotions").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/dashboard/promotions");
  return { success: true };
}
