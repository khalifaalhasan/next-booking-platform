import { createClient } from "@/utils/supabase/server";
import ServiceManager from "@/components/admin/ServiceManager";

export default async function AdminServicesPage() {
  const supabase = await createClient();

  // PERBAIKAN DI SINI: Tambahkan Relasi 'categories(name)'
  const { data: services } = await supabase
    .from("services")
    .select(
      `
      *,
      categories (
        name
      )
    `
    )
    .order("created_at", { ascending: false });

  // Casting manual karena tipe join Supabase kadang tricky
  // Pastikan ServiceManager menerima tipe data yang sesuai
  return <ServiceManager initialServices={(services as any) || []} />;
}
