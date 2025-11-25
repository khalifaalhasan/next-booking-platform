"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

type Category = Tables<"categories">;

const categorySchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  slug: z
    .string()
    .min(2, "Slug minimal 2 karakter")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan strip"),
  icon: z.string().optional(), // Bisa kosong (Emoji)
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  initialData?: Category | null;
  onSuccessAction: () => void;
}

export default function CategoryForm({
  initialData,
  onSuccessAction,
}: CategoryFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      icon: initialData?.icon || "",
    },
  });

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

  const onSubmit = async (values: CategoryFormValues) => {
    setLoading(true);
    try {
      const payload = {
        name: values.name,
        slug: values.slug,
        icon: values.icon,
      };

      let error;
      if (initialData) {
        const { error: updateError } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", initialData.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("categories")
          .insert(payload);
        error = insertError;
      }

      if (error) throw error;

      router.refresh();
      onSuccessAction();
    } catch (err: any) {
      alert("Gagal menyimpan kategori: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Kategori</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Gedung, Katering" {...field} />
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
                  <Input placeholder="gedung-katering" {...field} />
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

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon (Emoji)</FormLabel>
              <FormControl>
                <Input placeholder="🏢, 🚗, 📷" {...field} />
              </FormControl>
              <FormDescription>
                Masukkan 1 karakter Emoji agar tampilan menu lebih menarik.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onSuccessAction}>
            Batal
          </Button>
          <Button type="submit" disabled={loading} className="min-w-[100px]">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Simpan"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
