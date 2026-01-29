"use server";

import { createClient } from "@/utils/supabase/server";
import { bmnSchema, BmnFormValues } from "@/lib/schemas/bmn-schema"; // Sesuaikan path
import { revalidatePath } from "next/cache";

// --- CREATE ---
export async function createBmn(prevState: any, formData: FormData) {
  const supabase = await createClient();
  
  // Convert FormData ke Object
  const rawData = Object.fromEntries(formData.entries());
  
  // Validasi Zod
  const validated = bmnSchema.safeParse(rawData);
  
  if (!validated.success) {
    return { success: false, message: "Input tidak valid", errors: validated.error.flatten().fieldErrors };
  }

  const { error } = await supabase.from("bmn_records").insert(validated.data);

  if (error) {
    console.error("Create BMN Error:", error);
    return { success: false, message: "Gagal menyimpan data database." };
  }

  revalidatePath("/admin/bmn"); // Refresh halaman tabel
  return { success: true, message: "Data BMN berhasil disimpan!" };
}

// --- UPDATE ---
export async function updateBmn(id: string, formData: FormData) {
  const supabase = await createClient();
  const rawData = Object.fromEntries(formData.entries());
  const validated = bmnSchema.safeParse(rawData);

  if (!validated.success) {
    return { success: false, message: "Input tidak valid" };
  }

  const { error } = await supabase
    .from("bmn_records")
    .update({ ...validated.data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, message: "Gagal update data." };

  revalidatePath("/admin/bmn");
  return { success: true, message: "Data BMN diperbarui!" };
}

// --- DELETE (Yang kamu minta) ---
export async function deleteBmn(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.from("bmn_records").delete().eq("id", id);

  if (error) return { success: false, message: "Gagal menghapus data." };

  revalidatePath("/admin/bmn");
  return { success: true, message: "Data berhasil dihapus." };
}

// --- GET BY ID (Opsional, buat pre-fill form edit kalau mau fetch fresh data) ---
export async function getBmnById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("bmn_records").select("*").eq("id", id).single();
  return { data, error };
}