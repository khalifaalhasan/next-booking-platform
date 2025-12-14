import { createClient } from "@/utils/supabase/server";
import BlogCategoryManager from "@/components/admin/posts/BlogCategoryManager";
import { Tables } from "@/types/supabase";
import AdminPageHeader from "@/components/admin/AdminPageheader";

export default async function AdminBlogCategoriesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_categories")
    .select("*")
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <AdminPageHeader
          title="Kelola Kategori Blog"
          description=" Kelola topik dan label untuk artikel berita."
        />
      </div>
      <BlogCategoryManager
        initialCategories={(data as Tables<"blog_categories">[]) || []}
      />
    </div>
  );
}
