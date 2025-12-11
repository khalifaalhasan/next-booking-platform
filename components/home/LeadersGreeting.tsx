"use client";

import Image from "next/image";
import { Quote } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import SectionHeader from "../ui/SectionHeader";

const leaders = [
  {
    name: "Prof. Dr. Nyayu Khodijah, S.Ag., M.Si.",
    role: "Rektor UIN Raden Fatah",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop", // Ganti foto asli
    quote:
      "Transformasi digital adalah kunci kemajuan kampus islami yang unggul dan berdaya saing global.",
  },
  {
    name: "Dr. H. Ahmad Fulan, M.E.I",
    role: "Kepala Pusat Bisnis",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop",
    quote:
      "Kami berkomitmen mengelola aset negara secara profesional, transparan, dan akuntabel.",
  },
  {
    name: "Siti Aminah, S.E., M.Si",
    role: "Kasubag Tata Usaha",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop",
    quote:
      "Pelayanan prima kepada civitas akademika dan masyarakat umum adalah prioritas utama kami.",
  },
];

export default function LeadersGreeting() {
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
          subtitle=" Sinergi dan visi dari para pemimpin kami untuk mewujudkan layanan
              pusat bisnis yang unggul dan terpercaya."
          badge="Kepemimpinan"
          align="center"
        />

        {/* Grid Pimpinan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {leaders.map((leader, idx) => (
            <FadeIn key={idx} delay={idx * 0.2} className="h-full">
              <div className="group relative h-full flex flex-col">
                {/* 1. FOTO BESAR (PORTRAIT) */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-slate-200 shadow-lg">
                  {/* Image dengan Efek Grayscale -> Color */}
                  <Image
                    src={leader.image}
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
                      {leader.role}
                    </p>
                  </div>
                </div>

                {/* 2. QUOTE (Di luar foto, di bawah) */}
                <div className="mt-6 pl-4 border-l-2 border-blue-100 group-hover:border-blue-600 transition-colors duration-500">
                  <Quote className="w-6 h-6 text-blue-200 group-hover:text-blue-600 mb-2 transition-colors duration-500 fill-current" />
                  <p className="text-slate-600 italic font-serif leading-relaxed text-sm md:text-base">
                    &quot;{leader.quote}&quot;
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
