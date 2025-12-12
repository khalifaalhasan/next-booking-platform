import { Metadata } from "next";

// Import Komponen Modular

import VisionMission from "@/components/about/VisionMission";
import GoalsSection from "@/components/about/GoalsSection";
import TeamSection from "@/components/about/TeamSection";
import PageHeader from "@/components/ui/PageHeader";
import { createClient } from "@/utils/supabase/client";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Profil, Visi Misi, dan Struktur Organisasi UPT Pusat Pengembangan Bisnis UIN Raden Fatah Palembang.",
};

export default async function AboutPage() {
  const supabase = await createClient();

  // Fetch Teams
  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .order("sort_order", { ascending: true }); // Urutkan berdasarkan sort_order
  return (
    <div className="min-h-screen bg-white pb-20 font-sans">
      <PageHeader
        title="Tentang Kami"
        description="Profil, Visi Misi, dan Struktur Organisasi UPT Pusat Pengembangan Bisnis UIN Raden Fatah Palembang."
      />

      <div className="space-y-12">
        <VisionMission />
        <GoalsSection />
        <TeamSection teams={teams || []} />
      </div>
    </div>
  );
}
