import { createClient } from "@/utils/supabase/server";
import ServiceManager from "@/components/admin/service/ServiceManager";
import { Tables } from "@/types/supabase";

// 1. EXPORT Tipe Data ini agar bisa dipakai di ServiceManager.tsx
export type ServiceWithCategory = Tables<"services"> & {
  categories: {
    name: string;
  } | null;
};

export default async function AdminServicesPage() {
  const supabase = await createClient();

  // Fetch Data + Kategori
  const { data: services, error } = await supabase
    .from("services")
    .select(
      `
      *,
      categories ( name )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="p-8 text-red-500">Gagal memuat data layanan.</div>;
  }

  // 2. Casting data dari Supabase ke tipe custom kita
  // 'as unknown as ...' digunakan untuk bridging tipe yang aman
  const typedServices = (services as unknown as ServiceWithCategory[]) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Kelola Layanan
          </h1>
          <p className="text-slate-500 text-sm">
            Daftar gedung, kendaraan, dan aset yang disewakan.
          </p>
        </div>
      </div>

      {/* 3. Pass data ke Client Component */}
      <ServiceManager initialServices={typedServices} />
    </div>
  );
}
