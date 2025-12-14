"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Trash, UploadCloud, X, Wand2 } from "lucide-react";
import Image from "next/image";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Tables } from "@/types/supabase"; // Pastikan import ini ada

// --- TIPE DATA ---
// Gunakan tipe asli dari Supabase agar kompatibel dengan 'Json'
type ServiceData = Tables<"services">;

interface Category {
  id: string;
  name: string;
}

// --- SCHEMA VALIDASI (ZOD) ---
const serviceSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  slug: z
    .string()
    .min(2, "Slug minimal 2 karakter")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan strip"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  price: z.number().min(0, "Harga tidak boleh negatif"),
  unit: z.enum(["per_day", "per_hour"]),
  category_id: z.string().min(1, "Wajib pilih kategori"),
  is_active: z.boolean(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  // Terima data sesuai bentuk tabel DB (termasuk Json specs)
  initialData?: ServiceData | null;
  onSuccessAction: () => void;
}

export default function ServiceForm({
  initialData,
  onSuccessAction,
}: ServiceFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // State Gambar
  const [images, setImages] = useState<string[]>(initialData?.images || []);

  // --- STATE SPESIFIKASI (TYPE SAFE PARSING) ---
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(() => {
    const rawSpecs = initialData?.specifications;

    // Type Guard: Pastikan specs adalah object (bukan null/array/string)
    if (rawSpecs && typeof rawSpecs === "object" && !Array.isArray(rawSpecs)) {
      // Safe casting: Kita yakin ini object, kita mapping ke array state
      return Object.entries(rawSpecs).map(([key, value]) => ({
        key,
        value: String(value ?? ""), // Handle jika value null/undefined
      }));
    }
    return [{ key: "", value: "" }];
  });

  // --- SETUP FORM ---
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      unit: (initialData?.unit as "per_day" | "per_hour") || "per_day",
      category_id: initialData?.category_id || "",
      is_active: initialData?.is_active ?? true,
    },
  });

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");
      if (data) setCategories(data);
    };
    fetchCategories();
  }, [supabase]);

  // Auto Generate Slug
  const watchedName = form.watch("name");
  useEffect(() => {
    if (!initialData && watchedName) {
      const slug = watchedName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      form.setValue("slug", slug, { shouldValidate: true });
    }
  }, [watchedName, initialData, form]);

  const handleGenerateSlug = () => {
    const currentName = form.getValues("name");
    if (currentName) {
      const slug = currentName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      form.setValue("slug", slug, { shouldValidate: true });
    }
  };

  // Image Upload Logic
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `service-${Date.now()}.${fileExt}`;
    const filePath = `services/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      setImages((prev) => [...prev, urlData.publicUrl]);
      toast.success("Gambar berhasil diupload");
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Gagal upload gambar";
      toast.error(msg);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Specs Helper Functions
  const addSpec = () => setSpecs([...specs, { key: "", value: "" }]);
  const removeSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };
  const updateSpec = (index: number, field: "key" | "value", val: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = val;
    setSpecs(newSpecs);
  };

  // Submit Handler
  const onSubmit = async (values: ServiceFormValues) => {
    setLoading(true);
    try {
      // Convert specs array ke object JSONB yang valid
      const specsObject = specs.reduce((acc, curr) => {
        if (curr.key && curr.value) acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>);

      const payload = {
        name: values.name,
        slug: values.slug,
        description: values.description,
        price: values.price,
        unit: values.unit,
        category_id: values.category_id,
        is_active: values.is_active,
        images: images,
        specifications: specsObject, // Ini kompatibel dengan tipe Json
      };

      let error;
      if (initialData) {
        // UPDATE
        const { error: updateError } = await supabase
          .from("services")
          .update(payload)
          .eq("id", initialData.id);
        error = updateError;
      } else {
        // INSERT
        const { error: insertError } = await supabase
          .from("services")
          .insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      toast.success(initialData ? "Layanan diperbarui" : "Layanan ditambahkan");
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
        {/* === BAGIAN 1: INFORMASI DASAR === */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Layanan</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Gedung Serbaguna" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug URL</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="gedung-serbaguna" {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleGenerateSlug}
                      title="Generate Slug"
                    >
                      <Wand2 className="h-4 w-4 text-blue-600" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Harga (Rp)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      min={0}
                      value={field.value}
                      onChange={(e) => {
                        const val =
                          e.target.value === "" ? 0 : Number(e.target.value);
                        field.onChange(val);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Satuan</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Satuan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="per_day">Harian</SelectItem>
                      <SelectItem value="per_hour">Jam</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi Lengkap</FormLabel>
                <FormControl>
                  <Textarea
                    className="h-24 resize-none"
                    placeholder="Jelaskan fasilitas dan detail layanan..."
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* === BAGIAN 2: GALERI FOTO === */}
        <div className="space-y-2">
          <FormLabel>Galeri Foto</FormLabel>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((url, idx) => (
              <div
                key={idx}
                className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-slate-200 group"
              >
                <Image src={url} alt="Preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition z-10 hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 hover:border-slate-400 transition shrink-0">
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              ) : (
                <UploadCloud className="h-6 w-6 text-slate-400" />
              )}
              <span className="text-[10px] text-slate-500 mt-1 font-medium">
                {uploading ? "Uploading..." : "Upload Foto"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* === BAGIAN 3: SPESIFIKASI TEKNIS === */}
        <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between">
            <FormLabel className="text-slate-700">Spesifikasi Teknis</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSpec}
              className="h-7 text-xs bg-white"
            >
              <Plus className="h-3 w-3 mr-1" /> Tambah Spec
            </Button>
          </div>

          <div className="space-y-2">
            {specs.map((spec, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input
                  placeholder="Label (e.g. Luas)"
                  className="h-9 text-sm bg-white"
                  value={spec.key}
                  onChange={(e) => updateSpec(idx, "key", e.target.value)}
                />
                <Input
                  placeholder="Nilai (e.g. 100 m²)"
                  className="h-9 text-sm bg-white"
                  value={spec.value}
                  onChange={(e) => updateSpec(idx, "value", e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSpec(idx)}
                  className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* === STATUS AKTIF & BUTTONS === */}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-white shadow-sm">
              <div className="space-y-0.5">
                <FormLabel className="text-base font-medium">
                  Status Publikasi
                </FormLabel>
                <FormDescription className="text-xs">
                  Aktifkan agar layanan ini muncul di halaman publik.
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

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onSuccessAction}>
            Batal
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : initialData ? (
              "Simpan Perubahan"
            ) : (
              "Simpan Layanan"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
