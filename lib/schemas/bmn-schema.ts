import { z } from "zod";

export const bmnSchema = z.object({
  kode_barang: z.string().min(1, "Kode barang wajib diisi"),
  uraian_barang: z.string().min(3, "Nama barang wajib diisi"),
  nup: z.string().optional(),
  // Use coerce.number() to handle HTML input type="number" which returns strings
  tahun_perolehan: z.coerce
    .number()
    .min(1900, "Tahun tidak valid")
    .max(new Date().getFullYear() + 1),
  merek_tipe: z.string().optional(),

  kuantitas: z.coerce.number().min(1, "Minimal 1"),
  satuan: z.string().min(1, "Satuan wajib diisi"),
  nilai_perolehan: z.coerce.number().min(0, "Harga tidak boleh minus"),

  kondisi: z.enum(["Baik", "Rusak Ringan", "Rusak Berat"]),
  lokasi: z.string().optional(),
  bukti_kepemilikan: z.string().optional(),
  keterangan: z.string().optional(),
});

export type BmnFormValues = z.infer<typeof bmnSchema>;
