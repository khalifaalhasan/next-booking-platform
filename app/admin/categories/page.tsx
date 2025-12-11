import { createClient } from "@/utils/supabase/server";
import CategoryManager from "@/components/admin/categories/CategoryManager";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: true });

  return <CategoryManager initialCategories={categories || []} />;
}
