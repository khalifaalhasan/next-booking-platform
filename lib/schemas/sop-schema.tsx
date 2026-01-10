import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["application/pdf"];

export const sopSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter").max(100),
  description: z.string().optional(),
  // Validasi file agak tricky di server action, kita handle validasi tipe di client level z.instanceof(File)
  // Di server kita validasi lewat formData entry
});

// Tipe khusus untuk State Form di Client
export type SopFormValues = z.infer<typeof sopSchema> & {
  file: File | null;
};
