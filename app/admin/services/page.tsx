import { createClient } from "@/utils/supabase/server";
import ServiceManager from "@/components/admin/service/ServiceManager"; // Sesuaikan path jika folder Anda 'services' (plural)
import { Tables } from "@/types/supabase";
import AdminPageHeader from "@/components/admin/AdminPageheader";

// 1. EXPORT Tipe Data ini agar bisa di-import di ServiceManager.tsx
// Kita extend tipe tabel 'services' asli dengan relasi 'categories'
export type ServiceWithCategory = Tables<"services"> & {
  categories: {
    name: string;
  } | null;
};

// Agar data selalu fresh (tidak di-cache) saat admin membuka halaman
export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const supabase = await createClient();

  // Fetch Data Service + Nama Kategori
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
    console.error("Error fetching services:", error);
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-100">
        <p className="font-bold">Gagal memuat data layanan.</p>
        <p className="text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  // 2. Casting data ke tipe custom kita
  // 'as unknown' digunakan untuk bridging tipe Json Supabase ke tipe object TS kita
  const typedServices = services as unknown as ServiceWithCategory[];

  return (
    <div className="space-y-6">
      <div>
        <AdminPageHeader
          title="Kelola Layanan"
          description=" Daftar gedung, kendaraan, dan aset yang disewakan."
        />
      </div>

      {/* 3. Pass data ke Client Component */}
      <ServiceManager initialServices={typedServices || []} />
    </div>
  );
}
