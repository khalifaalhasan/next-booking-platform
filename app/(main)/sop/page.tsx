// src/app/sop/page.tsx
import { getSops } from "@/actions/sop-actions";
import SopList from "@/components/sop/sop-list"; // Client component
import PageHeader from "@/components/ui/PageHeader";

export default async function SopPage() {
  // Panggil action langsung sebagai function
  const { data: sops, error } = await getSops({ isAdminView: false });

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <PageHeader
        title="Standar Operasional Prosedur"
        description="Kumpulan panduan resmi dan protokol kerja untuk menjamin mutu, konsistensi, dan efisiensi layanan di lingkungan Pusat Pengembangan Bisnis"
      />

      {/* Lempar data ke Client Component */}
      <SopList initialData={sops || []} storageBaseUrl={""} />
    </div>
  );
}
