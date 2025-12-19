"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, UploadCloud, FileText, ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tables } from "@/types/supabase";

// Tipe Data
type Catalog = Tables<"catalogs">;

const catalogSchema = z.object({
  title: z.string().min(2, "Judul minimal 2 karakter"),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

type CatalogFormValues = z.infer<typeof catalogSchema>;

interface CatalogFormProps {
  initialData?: Catalog | null;
  onSuccessAction: () => void;
}

export default function CatalogForm({
  initialData,
  onSuccessAction,
}: CatalogFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);

  // State untuk File
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // State untuk Preview (saat edit atau setelah pilih file)
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(
    initialData?.pdf_url || null
  );
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState<string | null>(
    initialData?.thumbnail_url || null
  );

  const form = useForm<CatalogFormValues>({
    resolver: zodResolver(catalogSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      is_active: initialData?.is_active ?? true,
    },
  });

  // Handle File Select
  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: "pdf" | "thumbnail"
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === "pdf") {
        if (file.type !== "application/pdf")
          return toast.error("File harus format PDF");
        setPdfFile(file);
        setCurrentPdfUrl(URL.createObjectURL(file)); // Preview nama aja nanti
      } else {
        if (!file.type.startsWith("image/"))
          return toast.error("File harus gambar");
        setThumbnailFile(file);
        setCurrentThumbnailUrl(URL.createObjectURL(file)); // Preview gambar
      }
    }
  };

  // Upload Helper
  const uploadToStorage = async (file: File, folder: "pdfs" | "thumbnails") => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;

    const { error } = await supabase.storage
      .from("catalogs")
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage.from("catalogs").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const onSubmit = async (values: CatalogFormValues) => {
    // Validasi Wajib PDF saat Create
    if (!initialData && !pdfFile) {
      toast.error("Wajib upload file PDF Katalog");
      return;
    }

    setLoading(true);
    try {
      let finalPdfUrl = currentPdfUrl;
      let finalThumbnailUrl = currentThumbnailUrl;

      // 1. Upload PDF jika ada file baru
      if (pdfFile) {
        finalPdfUrl = await uploadToStorage(pdfFile, "pdfs");
      }

      // 2. Upload Thumbnail jika ada file baru
      if (thumbnailFile) {
        finalThumbnailUrl = await uploadToStorage(thumbnailFile, "thumbnails");
      }

      if (!finalPdfUrl) throw new Error("Gagal memproses URL PDF");

      const payload = {
        title: values.title,
        description: values.description,
        is_active: values.is_active,
        pdf_url: finalPdfUrl,
        thumbnail_url: finalThumbnailUrl,
        updated_at: new Date().toISOString(),
      };

      let error;
      if (initialData) {
        // UPDATE
        const { error: updateError } = await supabase
          .from("catalogs")
          .update(payload)
          .eq("id", initialData.id);
        error = updateError;
      } else {
        // INSERT
        const { error: insertError } = await supabase
          .from("catalogs")
          .insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      toast.success(initialData ? "Katalog diperbarui" : "Katalog ditambahkan");
      router.refresh();
      onSuccessAction();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* INPUT: TITLE */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul Katalog</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Katalog Produk 2025" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* INPUT: DESCRIPTION */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi Singkat</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Jelaskan isi katalog ini..."
                  className="resize-none h-20"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* UPLOAD: THUMBNAIL */}
          <div className="space-y-2">
            <FormLabel>Cover / Thumbnail (Opsional)</FormLabel>

            {currentThumbnailUrl ? (
              <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border border-slate-200 bg-slate-50 group">
                <Image
                  src={currentThumbnailUrl}
                  alt="Thumbnail"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setThumbnailFile(null);
                    setCurrentThumbnailUrl(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full aspect-[3/4] border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 hover:border-slate-400 transition">
                <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs text-slate-500 font-medium">
                  Upload Cover
                </span>
                <span className="text-[10px] text-slate-400">JPG/PNG Only</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "thumbnail")}
                />
              </label>
            )}
          </div>

          {/* UPLOAD: PDF */}
          <div className="space-y-2">
            <FormLabel>File PDF (Wajib)</FormLabel>

            <label className="flex flex-col items-center justify-center w-full aspect-[3/4] border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 hover:border-slate-400 transition bg-slate-50/50">
              <FileText
                className={`w-12 h-12 mb-3 ${
                  currentPdfUrl ? "text-red-500" : "text-slate-400"
                }`}
              />

              {currentPdfUrl ? (
                <div className="text-center px-4">
                  <span className="text-sm font-bold text-slate-700 block truncate max-w-[200px]">
                    {pdfFile ? pdfFile.name : "File PDF Tersimpan"}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Klik untuk ganti file
                  </span>
                </div>
              ) : (
                <div className="text-center">
                  <span className="text-xs text-slate-500 font-medium block">
                    Upload File PDF
                  </span>
                  <span className="text-[10px] text-slate-400">Maks. 10MB</span>
                </div>
              )}

              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => handleFileChange(e, "pdf")}
              />
            </label>
          </div>
        </div>

        {/* SWITCH: ACTIVE */}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-white">
              <div className="space-y-0.5">
                <FormLabel className="text-base font-medium">
                  Publikasikan Katalog
                </FormLabel>
                <FormDescription className="text-xs">
                  Jika aktif, katalog akan muncul di halaman pengunjung.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onSuccessAction}>
            Batal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Simpan Data"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
