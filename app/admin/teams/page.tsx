import { createClient } from "@/utils/supabase/server";
import TeamManager from "@/components/admin/teams/TeamManager";

export default async function AdminTeamsPage() {
  const supabase = await createClient();
  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Struktur Organisasi
        </h1>
        <p className="text-slate-500 text-sm">
          Kelola profil pimpinan dan staff.
        </p>
      </div>
      <TeamManager initialTeams={teams || []} />
    </div>
  );
}
