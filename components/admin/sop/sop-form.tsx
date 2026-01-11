"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import { useState, useTransition } from "react";
import { z } from "zod";
import { UploadCloud, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// 👇 IMPORT ACTION LENGKAP
import { createSop, updateSop, SopRow } from "@/actions/sop-actions";

// 👇 DEFINISI PROPS
interface SopFormProps {
  initialData?: SopRow; // Data untuk mode Edit
  onSuccess?: () => void; // Callback untuk menutup dialog
}

const formSchema = z.object({
  title: z.string().min(3, "Minimal 3 karakter"),
  description: z.string().optional(),
});

// 👇 FUNCTION MENERIMA PROPS
export default function SopForm({ initialData, onSuccess }: SopFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // 👇 LOGIC: Isi form otomatis jika ada initialData
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
    },
  });

  // Setup Dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    // 👇 Fix type safety
    onDrop: (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) setFile(acceptedFiles[0]);
    },
    onDropRejected: () => {
      toast.error("File harus PDF dan maksimal 5MB");
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // 👇 LOGIC VALIDASI FILE:
    // Jika Mode Create (!initialData) -> File WAJIB
    // Jika Mode Edit (initialData) -> File OPSIONAL
    if (!initialData && !file) {
      toast.error("Silakan upload file PDF terlebih dahulu");
      return;
    }

    const formData = new FormData();
    formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    if (file) formData.append("file", file);

    startTransition(async () => {
      let result;

      if (initialData) {
        // --- MODE UPDATE ---
        formData.append("id", initialData.id); // Wajib kirim ID
        result = await updateSop(null, formData);
      } else {
        // --- MODE CREATE ---
        result = await createSop(null, formData);
      }

      if (result?.success) {
        toast.success(result.message);
        // 👇 PENTING: Tutup dialog manager setelah sukses
        if (onSuccess) onSuccess();
      } else {
        toast.error(result?.message || "Terjadi kesalahan");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {/* 1. Title Input */}
      <div className="space-y-2">
        <Label htmlFor="title">Judul SOP</Label>
        <Input
          id="title"
          placeholder="Contoh: Prosedur Pengajuan Cuti"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* 2. Description Input */}
      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi (Opsional)</Label>
        <Textarea
          id="description"
          placeholder="Keterangan singkat..."
          {...register("description")}
        />
      </div>

      {/* 3. Drag & Drop Area */}
      <div className="space-y-2">
        <Label>
          Dokumen PDF{" "}
          {initialData && (
            <span className="text-xs text-muted-foreground font-normal">
              (Biarkan kosong jika tidak diubah)
            </span>
          )}
        </Label>

        {!file ? (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors
              ${
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 hover:bg-slate-50"
              }
            `}
          >
            <input {...getInputProps()} />
            <UploadCloud className="h-10 w-10 text-slate-400 mb-2" />
            <p className="text-sm text-slate-600 font-medium">
              {initialData
                ? "Klik untuk mengganti file"
                : "Klik atau tarik file PDF ke sini"}
            </p>
            <p className="text-xs text-slate-400 mt-1">Maksimal 5MB</p>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-100">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate max-w-[200px]">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
              <X className="h-4 w-4 text-slate-500 hover:text-red-500" />
            </Button>
          </div>
        )}
      </div>

      {/* 4. Submit Button */}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending
          ? "Memproses..."
          : initialData
          ? "Simpan Perubahan"
          : "Simpan SOP"}
      </Button>
    </form>
  );
}
