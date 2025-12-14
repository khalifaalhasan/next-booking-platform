import { createClient } from "@/utils/supabase/server";
import CategoryManager from "@/components/admin/categories/CategoryManager";
import AdminPageHeader from "@/components/admin/AdminPageheader";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <>
      <>
      <AdminPageHeader
                title="Kelola Kategori Layanan"
                description=" Daftar gedung, kendaraan, dan aset yang disewakan."
              />
      </>
      <CategoryManager initialCategories={categories || []} />
    </>
  );
}
