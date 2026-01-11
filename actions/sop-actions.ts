// src/actions/sop.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { Database } from "@/types/supabase"; // Import tipe generate
// Tambahkan import ini di paling atas

import { redirect } from "next/navigation";
import { z } from "zod";

// 1. Definisikan tipe dari Database, bukan manual
export type SopRow = Database["public"]["Tables"]["sops"]["Row"];

interface GetSopsParams {
  query?: string;
  isAdminView?: boolean;
}

// 2. Ubah return type function
export async function getSops({
  query = "",
  isAdminView = false,
}: GetSopsParams = {}) {
  const supabase = createClient();

  try {
    let dbQuery = (await supabase)
      .from("sops")
      .select("*")
      .order("created_at", { ascending: false });

    if (!isAdminView) {
      dbQuery = dbQuery.eq("is_active", true);
    }

    if (query) {
      dbQuery = dbQuery.ilike("title", `%${query}%`);
    }

    // Supabase otomatis mengembalikan tipe SopRow[]
    const { data, error } = await dbQuery;

    if (error) {
      throw new Error(error.message);
    }

    // Casting data agar TypeScript yakin ini SopRow[]
    return { success: true, data: data as SopRow[] };
  } catch (error) {
    console.error("Error fetching SOPs:", error);
    return {
      success: false,
      data: [] as SopRow[],
      error: "Gagal mengambil data SOP.",
    };
  }
}

// ... code getSops sebelumnya ...

// --- ACTION BARU: UPLOAD SOP ---
const uploadSchemaServer = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  file: z
    .instanceof(File, { message: "File PDF wajib diunggah" })
    .refine((file) => file.size <= 5 * 1024 * 1024, "Ukuran file maksimal 5MB")
    .refine(
      (file) => file.type === "application/pdf",
      "File harus berformat PDF"
    ),
});

export async function createSop(prevState: any, formData: FormData) {
  const supabase = createClient();

  // 1. Validasi Input
  const validatedFields = uploadSchemaServer.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    file: formData.get("file"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Gagal validasi data.",
    };
  }

  const { title, description, file } = validatedFields.data;

  try {
    // 2. Upload File ke Supabase Storage
    // Rename file agar unik (timestamp + sanitized name)
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${title
      .replace(/\s+/g, "-")
      .toLowerCase()}.${fileExt}`;
    const filePath = `sops/${fileName}`; // Folder 'sops' di dalam bucket

    const { error: uploadError } = await (
      await supabase
    ).storage
      .from("sops-files") // Ganti dengan nama bucket kamu
      .upload(filePath, file);

    if (uploadError) throw new Error("Gagal upload file ke Storage");

    // 3. Insert Metadata ke Database
    const { error: dbError } = await (await supabase).from("sops").insert({
      title,
      description,
      file_path: filePath,
      file_size: file.size,
      is_active: true,
    });

    if (dbError) throw new Error("Gagal menyimpan data ke database");
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Terjadi kesalahan server saat menyimpan SOP.",
    };
  }

  // 4. Revalidate & Redirect
  revalidatePath("/sop");
  revalidatePath("/admin/sop");
  redirect("/admin/sop"); // Redirect kembali ke list admin
}

// ... code getSops & createSop sebelumnya tetap ada ...

// --- SCHEMA UPDATE ---
// File bersifat opsional saat update
const updateSchemaServer = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  file: z.instanceof(File).optional(), // Opsional
});

// --- ACTION: UPDATE SOP ---
export async function updateSop(prevState: any, formData: FormData) {
  const supabase = createClient();

  // Parse data
  const rawData = {
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description"),
    file: formData.get("file") as File | null,
  };

  // Jika file kosong (size 0), anggap undefined agar tidak divalidasi
  if (rawData.file && rawData.file.size === 0) {
    delete (rawData as any).file;
  }

  const validated = updateSchemaServer.safeParse(rawData);

  if (!validated.success) {
    return { success: false, message: "Data tidak valid." };
  }

  const { id, title, description, file } = validated.data;

  try {
    const updates: any = {
      title,
      description,
      
    };

    // Logic ganti file jika user upload baru
    if (file && file.size > 0) {
      // 1. Ambil path lama untuk dihapus (Opsional, good practice untuk hemat storage)
      const { data: oldData } = await (await supabase)
        .from("sops")
        .select("file_path")
        .eq("id", id)
        .single();

      // 2. Upload file baru
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${title
        .replace(/\s+/g, "-")
        .toLowerCase()}.${fileExt}`;
      const filePath = `sops/${fileName}`;

      const { error: uploadError } = await (await supabase).storage
        .from("sops-files")
        .upload(filePath, file);
      if (uploadError) throw new Error("Gagal upload file baru");

      // 3. Update path di object update & Hapus file lama
      updates.file_path = filePath;
      updates.file_size = file.size;

      if (oldData?.file_path) {
        await (await supabase).storage
          .from("sops-files")
          .remove([oldData.file_path]);
      }
    }

    // Eksekusi Update DB
    const { error } = await (await supabase)
      .from("sops")
      .update(updates)
      .eq("id", id);
    if (error) throw error;
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal update SOP." };
  }

  revalidatePath("/admin/sop");
  return { success: true, message: "SOP berhasil diperbarui" };
}

// --- ACTION: DELETE SOP ---
export async function deleteSop(id: string, filePath: string) {
  const supabase = createClient();

  try {
    // 1. Hapus File di Storage
    const { error: storageError } = await (await supabase).storage
      .from("sops-files")
      .remove([filePath]);
    if (storageError)
      console.warn("Gagal hapus file fisik, lanjut hapus data DB...");

    // 2. Hapus Data di DB
    const { error: dbError } = await (await supabase)
      .from("sops")
      .delete()
      .eq("id", id);
    if (dbError) throw dbError;

    revalidatePath("/admin/sop");
    return { success: true, message: "SOP dihapus." };
  } catch (error) {
    return { success: false, message: "Gagal menghapus SOP." };
  }
}
