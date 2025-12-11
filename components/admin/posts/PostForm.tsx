"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, X, Wand2, ImageIcon, Star } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Tables } from "@/types/supabase";

type Post = Tables<"posts">;
type BlogCategory = Tables<"blog_categories">;

const postSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter"),
  slug: z
    .string()
    .min(5, "Slug minimal 5 karakter")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan strip"),
  content: z.string().min(20, "Konten terlalu pendek"),
  category: z.string().min(1, "Pilih kategori"),
  is_published: z.boolean(),
  is_featured: z.boolean(), // Tambahan
});

type PostFormValues = z.infer<typeof postSchema>;

interface PostFormProps {
  initialData?: Post | null;
  onSuccessAction: () => void;
}

export default function PostForm({
  initialData,
  onSuccessAction,
}: PostFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [thumbnail, setThumbnail] = useState<string>("");
  const [categories, setCategories] = useState<BlogCategory[]>([]);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      category: "",
      is_published: false,
      is_featured: false,
    },
  });

  // Fetch Kategori dari DB
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("blog_categories")
        .select("*")
        .order("name");
      if (data) setCategories(data);
    };
    fetchCategories();
  }, [supabase]);

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        slug: initialData.slug,
        content: initialData.content || "",
        category: initialData.category || "",
        is_published: initialData.is_published ?? false,
        is_featured: initialData.is_featured ?? false,
      });
      setThumbnail(initialData.thumbnail_url || "");
    } else {
      form.reset({
        title: "",
        slug: "",
        content: "",
        category: "",
        is_published: false,
        is_featured: false,
      });
      setThumbnail("");
    }
  }, [initialData, form]);

  const handleGenerateSlug = () => {
    const currentTitle = form.getValues("title");
    if (currentTitle) {
      const slug = currentTitle
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-");
      form.setValue("slug", slug, { shouldValidate: true });
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const file = e.target.files[0];
    const filePath = `blog/${Date.now()}-${file.name}`;

    try {
      const { error } = await supabase.storage
        .from("images")
        .upload(filePath, file);
      if (error) throw error;
      const { data } = supabase.storage.from("images").getPublicUrl(filePath);
      setThumbnail(data.publicUrl);
    } catch (error) {
      let msg = "Gagal upload";
      if (error instanceof Error) msg = error.message;
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: PostFormValues) => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const payload = {
        ...values,
        thumbnail_url: thumbnail,
        author_id: user?.id,
      };

      let error;
      if (initialData) {
        const { error: updateError } = await supabase
          .from("posts")
          .update(payload)
          .eq("id", initialData.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("posts")
          .insert(payload);
        error = insertError;
      }

      if (error) throw error;
      toast.success(initialData ? "Artikel diperbarui" : "Artikel dibuat");
      router.refresh();
      onSuccessAction();
    } catch (err) {
      let msg = "Terjadi kesalahan";
      if (err instanceof Error) msg = err.message;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-5 custom-scrollbar">
          {/* --- COVER IMAGE --- */}
          <div className="space-y-3">
            <FormLabel>Gambar Sampul</FormLabel>
            <div className="relative w-full aspect-video bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center overflow-hidden group hover:bg-slate-100 transition">
              {thumbnail ? (
                <>
                  <Image
                    src={thumbnail}
                    alt="Cover"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setThumbnail("")}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="text-center text-slate-400">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <span className="text-xs font-medium">Upload Cover</span>
                </div>
              )}
              {!thumbnail && !uploading && (
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleUpload}
                />
              )}
              {uploading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <Loader2 className="animate-spin text-blue-600" />
                </div>
              )}
            </div>
          </div>

          {/* --- FIELDS --- */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Judul</FormLabel>
                <FormControl>
                  <Input placeholder="Judul..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="url-slug" {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleGenerateSlug}
                    >
                      <Wand2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* KATEGORI DINAMIS */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Konten</FormLabel>
                <FormControl>
                  <Textarea className="min-h-[200px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* --- SWITCHES --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="is_published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-white">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-bold">Publish</FormLabel>
                    <FormDescription className="text-xs">
                      Tampilkan ke publik?
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
            <FormField
              control={form.control}
              name="is_featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-blue-50 border-blue-200">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-bold text-blue-900 flex items-center gap-2">
                      <Star className="w-4 h-4 fill-blue-600 text-blue-600" />{" "}
                      Unggulan
                    </FormLabel>
                    <FormDescription className="text-xs text-blue-700">
                      Tampilkan di highlight utama?
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
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onSuccessAction}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
