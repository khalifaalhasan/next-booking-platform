import { createClient } from "@/utils/supabase/server";
import AdminPageHeader from "@/components/admin/AdminPageheader";
import CatalogManager from "@/components/admin/catalogs/CatalogManager";
import { Tables } from "@/types/supabase";

export const dynamic = "force-dynamic";

export default async function AdminCatalogsPage() {
  const supabase = await createClient();

  // Fetch Data Catalog
  const { data: catalogs, error } = await supabase
    .from("catalogs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-8 text-red-500 bg-red-50 rounded-xl border border-red-100">
        Gagal memuat data katalog: {error.message}
      </div>
    );
  }

  // Casting type agar aman
  const typedCatalogs = catalogs as unknown as Tables<"catalogs">[];

  return (
    <>
      <AdminPageHeader
        title="Katalog Digital"
        description="Upload majalah digital, brosur, atau portofolio produk UPT dalam format PDF."
      />

      <CatalogManager initialData={typedCatalogs || []} />
    </>
  );
}
