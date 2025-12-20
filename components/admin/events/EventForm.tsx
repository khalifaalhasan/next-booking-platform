"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Calendar, MapPin, ImageIcon, X } from "lucide-react";
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

type Event = Tables<"events">;

const eventSchema = z.object({
  title: z.string().min(2, "Judul wajib diisi"),
  description: z.string().optional(),
  location: z.string().optional(),
  event_date: z.string().min(1, "Tanggal wajib diisi"), // Kita pakai string ISO dari input datetime-local
  is_active: z.boolean(),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface EventFormProps {
  initialData?: Event | null;
  onSuccessAction: () => void;
}

export default function EventForm({ initialData, onSuccessAction }: EventFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  
  // State Gambar
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(initialData?.thumbnail_url || null);

  // Helper format tanggal untuk input type="datetime-local" (YYYY-MM-DDTHH:mm)
  const defaultDate = initialData?.event_date 
    ? new Date(initialData.event_date).toISOString().slice(0, 16) 
    : "";

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      location: initialData?.location || "",
      event_date: defaultDate,
      is_active: initialData?.is_active ?? true,
    },
  });

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) return toast.error("File harus gambar");
      setImageFile(file);
      setCurrentImageUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (values: EventFormValues) => {
    setLoading(true);
    try {
      let finalImageUrl = currentImageUrl;

      // Upload Gambar Baru jika ada
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("events")
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage.from("events").getPublicUrl(fileName);
        finalImageUrl = data.publicUrl;
      }

      const payload = {
        title: values.title,
        description: values.description,
        location: values.location,
        event_date: new Date(values.event_date).toISOString(), // Convert balik ke UTC ISO
        is_active: values.is_active,
        thumbnail_url: finalImageUrl,
        updated_at: new Date().toISOString(),
      };

      let error;
      if (initialData) {
        const { error: updateError } = await supabase
          .from("events")
          .update(payload)
          .eq("id", initialData.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("events")
          .insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      toast.success(initialData ? "Event diperbarui" : "Event dibuat");
      router.refresh();
      onSuccessAction();
    } catch (err) {
      toast.error("Terjadi kesalahan menyimpan event");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        {/* GAMBAR */}
        <div className="space-y-2">
          <FormLabel>Poster Event</FormLabel>
          {currentImageUrl ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-slate-100 group">
              <Image src={currentImageUrl} alt="Preview" fill className="object-cover" />
              <button
                type="button"
                onClick={() => { setImageFile(null); setCurrentImageUrl(null); }}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition">
              <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs text-slate-500">Upload Poster (16:9)</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          )}
        </div>

        {/* JUDUL */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Event</FormLabel>
              <FormControl><Input placeholder="Contoh: Workshop Digital Marketing" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* TANGGAL & WAKTU */}
          <FormField
            control={form.control}
            name="event_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Waktu Pelaksanaan</FormLabel>
                <FormControl>
                  {/* Native datetime picker for simplicity */}
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* LOKASI */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lokasi</FormLabel>
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input className="pl-9" placeholder="Contoh: Aula Lt. 3 / Zoom Meeting" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* DESKRIPSI */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi Singkat</FormLabel>
              <FormControl>
                <Textarea className="resize-none h-24" placeholder="Jelaskan detail acara..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* STATUS ACTIVE */}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3 bg-slate-50">
              <div className="space-y-0.5">
                <FormLabel>Status Publikasi</FormLabel>
                <FormDescription>Tampilkan event ini di website utama?</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onSuccessAction}>Batal</Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Simpan Event
          </Button>
        </div>
      </form>
    </Form>
  );
}