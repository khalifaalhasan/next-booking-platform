"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; 
import { createPromotion, updatePromotion } from "@/actions/promotion-actions";
import { toast } from "sonner";
import { Loader2, Info } from "lucide-react"; // Tambah Icon Info
import { Database } from "@/types/supabase";
import Image from "next/image";

type Promotion = Database["public"]["Tables"]["promotions"]["Row"];

interface PromotionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Promotion | null;
}

export default function PromotionForm({ onSuccess, onCancel, initialData }: PromotionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link_url: "",
    badge_text: "",
    start_date: "",
    end_date: "",
    is_active: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        link_url: initialData.link_url || "",
        badge_text: initialData.badge_text || "",
        start_date: formatDate(initialData.start_date),
        end_date: formatDate(initialData.end_date),
        is_active: initialData.is_active ?? true,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("link_url", formData.link_url);
      payload.append("badge_text", formData.badge_text);
      payload.append("start_date", formData.start_date);
      payload.append("end_date", formData.end_date);
      payload.append("is_active", String(formData.is_active));

      if (file) {
        payload.append("image_file", file);
      }

      let result;
      if (initialData) {
        payload.append("old_image_url", initialData.image_url);
        result = await updatePromotion(initialData.id, payload);
      } else {
        result = await createPromotion(payload);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(initialData ? "Berhasil update promo" : "Berhasil buat promo");
        onSuccess();
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <div className="grid gap-4 py-2">
        {/* Title */}
        <div className="space-y-2">
          <Label>Judul Promo <span className="text-red-500">*</span></Label>
          <Input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Contoh: Diskon Kemerdekaan" />
        </div>

        {/* Badge & Link */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Badge (Opsional)</Label>
            <Input value={formData.badge_text} onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })} placeholder="HOT DEAL" />
          </div>
          <div className="space-y-2">
            <Label>Link URL (Opsional)</Label>
            <Input value={formData.link_url} onChange={(e) => setFormData({ ...formData, link_url: e.target.value })} placeholder="https://..." />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>Deskripsi</Label>
          <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Keterangan singkat..." />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tanggal Mulai <span className="text-red-500">*</span></Label>
            <Input type="date" required value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Tanggal Selesai <span className="text-red-500">*</span></Label>
            <Input type="date" required value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
          </div>
        </div>

        {/* --- UPDATE BAGIAN INI: IMAGE UPLOAD DENGAN NOTES --- */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <Label>Banner Gambar <span className="text-red-500">*</span></Label>
            
            {/* Preview Old Image */}
            {initialData && !file && (
                <div className="relative w-full h-32 rounded-md border overflow-hidden mb-2 bg-slate-200">
                    <Image src={initialData.image_url} alt="Current" fill className="object-cover" />
                </div>
            )}
            
            <Input 
                type="file" 
                accept="image/*" 
                required={!initialData} 
                className="bg-white"
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
            />
            
            {/* NOTES UKURAN IDEAL */}
            <div className="flex gap-2 text-[11px] text-slate-500 bg-blue-50/50 p-2 rounded border border-blue-100 items-start">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                   <span className="font-semibold text-slate-700">Rekomendasi Ukuran:</span> <br/>
                   Resolusi ideal <strong>1200 x 500 px</strong> (Landscape). <br/>
                   Maksimal ukuran file <strong>2MB</strong> (JPG/PNG).
                   {!initialData && " Wajib upload gambar baru."}
                </div>
            </div>
        </div>

        {/* Status Toggle */}
        <div className="flex items-center justify-between border p-4 rounded-lg bg-white">
            <div className="space-y-0.5">
                <Label className="text-base">Status Aktif</Label>
                <p className="text-xs text-slate-500">Aktifkan agar banner tampil di halaman depan.</p>
            </div>
            <Switch 
                checked={formData.is_active}
                onCheckedChange={(val) => setFormData({ ...formData, is_active: val })}
            />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t mt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Batal</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Simpan Perubahan" : "Buat Promo"}
        </Button>
      </div>
    </form>
  );
}