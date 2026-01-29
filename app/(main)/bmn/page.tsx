import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import BmnPublicList from "@/components/bmn/bmn-public-list";
import PageHeader from "@/components/ui/PageHeader"; // Pastikan path ini sesuai dengan projectmu

export const metadata: Metadata = {
  title: "Data BMN | Pusat Pengembangan Bisnis",
  description: "Informasi Inventaris Barang Milik Negara (BMN) di lingkungan Pusat Pengembangan Bisnis UIN Raden Fatah.",
};

// Revalidate data setiap 60 detik (ISR) agar tidak terlalu sering hit database,
// tapi tetap cukup update. Hapus baris ini jika ingin Realtime (Dynamic).
export const revalidate = 60; 

export default async function BmnUserPage() {
  const supabase = await createClient();

  // Fetch Data BMN
  const { data: bmnData, error } = await supabase
    .from("bmn_records")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching BMN:", error);
    // Kita tetap render halaman kosong agar user tidak melihat error 500
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* 1. Header Halaman */}
      <PageHeader
        title="Inventaris BMN"
        description="Transparansi data aset dan barang milik negara yang dikelola oleh Pusat Pengembangan Bisnis."
      />

      {/* 2. Kontainer Utama */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        
        {/* Component List */}
        <BmnPublicList initialData={bmnData || []} />
        
      </div>
    </div>
  );
}