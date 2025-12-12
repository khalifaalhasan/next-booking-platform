"use client";

import Image from "next/image";
import FadeIn from "@/components/ui/FadeIn";
import SectionHeader from "@/components/ui/SectionHeader";
import { Tables } from "@/types/supabase";

// Menerima props 'teams'
export default function TeamSection({ teams }: { teams: Tables<"teams">[] }) {
  return (
    <section className="py-16">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Struktur Organisasi"
          subtitle="Tim profesional di balik operasional Pusat Pengembangan Bisnis."
        />

        {/* Jika kosong */}
        {teams.length === 0 && (
          <div className="text-center py-10 text-slate-400 italic">
            Belum ada data struktur organisasi.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
          {teams.map((member, idx) => (
            <FadeIn key={member.id} delay={idx * 0.1}>
              <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative h-72 w-full bg-slate-100 overflow-hidden">
                  {member.image_url ? (
                    <Image
                      src={member.image_url}
                      alt={member.name}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition duration-500 grayscale group-hover:grayscale-0"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      No Photo
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-bold text-lg leading-tight text-shadow">
                      {member.name}
                    </p>
                    <p className="text-blue-300 text-xs font-bold uppercase tracking-wider mt-1">
                      {member.position}
                    </p>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                    {member.bio || "Anggota profesional kami."}
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
