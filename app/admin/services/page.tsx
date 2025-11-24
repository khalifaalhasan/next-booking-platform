import { createClient } from "@/utils/supabase/server";
import ServiceManager from "@/components/pages/admin/ServiceManager";

export default async function AdminServicesPage() {
  const supabase = await createClient();

  // Fetch data di server (SEO friendly & Cepat)
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: false });

  // Oper data ke Client Component yang menghandle interaksi (Modal/Dialog)
  return <ServiceManager initialServices={services || []} />;
}
