import Image from "next/image";
import { Quote } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import SectionHeader from "../ui/SectionHeader";
import { createClient } from "@/utils/supabase/server";

export default async function LeadersGreeting() {
  // 1. Inisialisasi Supabase Client
  const supabase = await createClient();

  // 2. Fetch Data (Ambil urutan 1, 2, 3)
  const { data: leaders } = await supabase
    .from("teams")
    .select("*")
    .in("sort_order", [1, 2, 3])
    .order("sort_order", { ascending: true });

  // Fallback jika data kosong agar tidak error
  const displayedLeaders = leaders || [];

  return (
    <section className="py-24 bg-white border-b border-slate-100 relative overflow-hidden">
      {/* Background Decoration (Subtle Lines) */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-slate-50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white via-transparent to-transparent" />
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <SectionHeader
          title="Sambutan Pimpinan"
          subtitle="Sinergi dan visi dari para pemimpin kami untuk mewujudkan layanan pusat bisnis yang unggul dan terpercaya."
          badge="Kepemimpinan"
          align="center"
        />

        {/* Grid Pimpinan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayedLeaders.map((leader, idx) => (
            <FadeIn key={leader.id} delay={idx * 0.2} className="h-full">
              <div className="group relative h-full flex flex-col">
                {/* 1. FOTO BESAR (PORTRAIT) */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-slate-200 shadow-lg">
                  {/* Image dengan Efek Grayscale -> Color */}
                  <Image
                    src={leader.image_url || "/images/placeholder-avatar.jpg"} // Fallback image jika null
                    alt={leader.name}
                    fill
                    className="object-cover transition-all duration-700 ease-out group-hover:scale-105 filter grayscale group-hover:grayscale-0"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw"
                  />

                  {/* Gradient Overlay (Agar teks nama terbaca jelas) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-500"></div>

                  {/* Nama & Jabatan (Di dalam foto, bagian bawah) */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="w-10 h-1 bg-blue-500 mb-4 rounded-full"></div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1 leading-snug">
                      {leader.name}
                    </h3>
                    <p className="text-blue-200 text-sm font-medium uppercase tracking-wider">
                      {leader.position}
                    </p>
                  </div>
                </div>

                {/* 2. QUOTE (Di luar foto, di bawah) */}
                {/* Menggunakan kolom 'bio' sebagai quote */}
                <div className="mt-6 pl-4 border-l-2 border-blue-100 group-hover:border-blue-600 transition-colors duration-500">
                  <Quote className="w-6 h-6 text-blue-200 group-hover:text-blue-600 mb-2 transition-colors duration-500 fill-current" />
                  <p className="text-slate-600 italic font-serif leading-relaxed text-sm md:text-base">
                    &quot;{leader.bio}&quot;
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
