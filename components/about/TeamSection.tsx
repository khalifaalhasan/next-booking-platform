"use client";

import Image from "next/image";
import FadeIn from "@/components/ui/FadeIn";
import SectionHeader from "@/components/ui/SectionHeader";

// DUMMY DATA (Nanti diganti fetch dari DB)
const teamMembers = [
  {
    id: 1,
    name: "Dr. H. Ahmad Fulan, M.E.I",
    position: "Kepala Pusat",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop",
    bio: "Berpengalaman lebih dari 15 tahun dalam manajemen aset publik.",
  },
  {
    id: 2,
    name: "Siti Aminah, S.E., M.Si",
    position: "Sekretaris",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",
    bio: "Ahli dalam administrasi dan tata kelola keuangan negara.",
  },
  {
    id: 3,
    name: "Budi Santoso, S.Kom",
    position: "Koordinator IT & Aset",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop",
    bio: "Fokus pada digitalisasi layanan dan pemeliharaan infrastruktur.",
  },
  {
    id: 4,
    name: "Rina Wati, S.Ak",
    position: "Bendahara",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop",
    bio: "Menjaga akuntabilitas dan transparansi keuangan unit.",
  },
  {
    id: 5,
    name: "Dr. H. Ahmad Fulan, M.E.I",
    position: "Kepala Pusat",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop",
    bio: "Berpengalaman lebih dari 15 tahun dalam manajemen aset publik.",
  },
  {
    id: 6,
    name: "Siti Aminah, S.E., M.Si",
    position: "Sekretaris",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",
    bio: "Ahli dalam administrasi dan tata kelola keuangan negara.",
  },
  {
    id: 7,
    name: "Budi Santoso, S.Kom",
    position: "Koordinator IT & Aset",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop",
    bio: "Fokus pada digitalisasi layanan dan pemeliharaan infrastruktur.",
  },
  {
    id: 8,
    name: "Rina Wati, S.Ak",
    position: "Bendahara",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop",
    bio: "Menjaga akuntabilitas dan transparansi keuangan unit.",
  },
];

export default function TeamSection() {
  return (
    <section className="py-16">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Struktur Organisasi"
          subtitle="Tim profesional di balik operasional Pusat Pengembangan Bisnis."
          badge="Organisasi"
          align="center"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
          {teamMembers.map((member, idx) => (
            <FadeIn key={member.id} delay={idx * 0.1}>
              <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                {/* Image Container */}
                <div className="relative h-64 w-full bg-slate-100 overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition duration-500 grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-bold text-lg leading-tight text-shadow">
                      {member.name}
                    </p>
                    <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mt-1">
                      {member.position}
                    </p>
                  </div>
                </div>

                {/* Bio / Description */}
                <div className="p-5">
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                    {member.bio}
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
