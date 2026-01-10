import { getSops } from "@/actions/sop-actions";
import AdminSopManager from "@/components/admin/sop/sop-manager";

export default async function AdminSopPage() {
  // Fetch data di server
  const { data } = await getSops({ isAdminView: true });

  return (
    <div className="container py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen SOP</h1>
        <p className="text-muted-foreground">
          Kelola daftar prosedur operasional standar.
        </p>
      </div>

      {/* Load Client Component dengan data awal */}
      <AdminSopManager data={data || []} />
    </div>
  );
}
