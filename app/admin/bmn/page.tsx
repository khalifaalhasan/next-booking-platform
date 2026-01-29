// app/admin/bmn/page.tsx
import { createClient } from "@/utils/supabase/server";
import BmnManager from "@/components/admin/bmn/form-manager";

export default async function BmnPage() {
  const supabase = await createClient();

  // Fetch data di server
  const { data: bmnList } = await supabase
    .from("bmn_records")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">
        Inventaris BMN (KKI)
      </h1>

      {/* Lempar data ke Manager */}
      <BmnManager initialData={bmnList || []} />
    </div>
  );
}
