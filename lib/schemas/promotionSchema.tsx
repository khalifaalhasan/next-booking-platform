import { z } from "zod";

export const promotionFormSchema = z.object({
  // 1. STRING: Gunakan .min(1) untuk handle "Required" pada form
  title: z
    .string()
    .min(1, { message: "Judul wajib diisi" }) // Pesan error kustom disini
    .max(100, "Judul maksimal 100 karakter"),

  description: z.string().optional(),
  badge_text: z.string().optional(),

  // 2. URL: Gunakan .url() jika ada isinya, atau izinkan string kosong/undefined
  link_url: z
    .string()
    .optional()
    .or(z.literal("")), 

  is_active: z.boolean().default(true),

  // 3. DATE: Hapus parameter error di dalam z.coerce.date() untuk menghilangkan error TS
  // Kita gunakan validasi default dulu. Jika input HTML sudah 'required', user jarang bisa kirim data kosong.
  start_date: z.coerce.date(),

  end_date: z.coerce.date(),

  // File Image biarkan any (validasi di server action)
  image_file: z.any().optional(),
})
// Validasi Logika: Tanggal Selesai vs Mulai
.refine((data) => data.end_date >= data.start_date, {
  message: "Tanggal berakhir tidak boleh sebelum tanggal mulai",
  path: ["end_date"],
});

export type PromotionFormValues = z.infer<typeof promotionFormSchema>;