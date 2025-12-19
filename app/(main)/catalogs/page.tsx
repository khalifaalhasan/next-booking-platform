import { createClient } from "@/utils/supabase/server";
import { BookOpen } from "lucide-react";
import CatalogGrid from "@/components/catalog/CatalogGrid"; // Pastikan import ini benar
import { Tables } from "@/types/supabase";
import PageHeader from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function CatalogsPage() {
  const supabase = await createClient();

  // Ambil data katalog aktif
  const { data: catalogs } = await supabase
    .from("catalogs")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // Casting type agar aman
  const typedCatalogs = (catalogs as unknown as Tables<"catalogs">[]) || [];

  return (
    <div>
      <PageHeader
        title="E-Magazine & Katalog UPT"
        description="Jelajahi profil, laporan, dan portofolio layanan kami dalam format
            digital interaktif."
      />

      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Panggil Component Grid (yang sekarang pakai Iframe) */}
          <CatalogGrid catalogs={typedCatalogs} />

          {typedCatalogs.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>Belum ada katalog yang diterbitkan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
