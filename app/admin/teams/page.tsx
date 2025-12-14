import { createClient } from "@/utils/supabase/server";
import TeamManager from "@/components/admin/teams/TeamManager";
import AdminPageHeader from "@/components/admin/AdminPageheader";

export default async function AdminTeamsPage() {
  const supabase = await createClient();
  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <AdminPageHeader
          title="Struktur Organisasi"
          description="Kelola profil pimpinan, staff, dan urutan tampilan di website."
        />
      </div>
      <TeamManager initialTeams={teams || []} />
    </div>
  );
}
