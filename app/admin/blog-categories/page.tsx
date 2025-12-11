import { createClient } from "@/utils/supabase/server";
import BlogCategoryManager from "@/components/admin/posts/BlogCategoryManager";
import { Tables } from "@/types/supabase";

export default async function AdminBlogCategoriesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_categories")
    .select("*")
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Kategori Blog
        </h1>
        <p className="text-slate-500 text-sm">
          Kelola topik dan label untuk artikel berita.
        </p>
      </div>
      <BlogCategoryManager
        initialCategories={(data as Tables<"blog_categories">[]) || []}
      />
    </div>
  );
}
