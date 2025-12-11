"use client";

import Image from "next/image";
import { Target, CheckCircle2 } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";

export default function VisionMission() {
  return (
    <section className="py-16">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Visual Image */}
          <FadeIn direction="right">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] group">
              <Image
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
                alt="Gedung UIN"
                fill
                className="object-cover group-hover:scale-105 transition duration-700"
              />
              <div className="absolute inset-0 bg-blue-900/20 group-hover:bg-blue-900/10 transition"></div>
            </div>
          </FadeIn>

          {/* Text Content */}
          <div className="space-y-8">
            <FadeIn direction="left" delay={0.2}>
              <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100">
                <h3 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-3">
                  <Target className="w-6 h-6" /> Visi
                </h3>
                <p className="text-blue-800 leading-relaxed font-medium italic">
                  &quot;Menjadi pusat pengembangan bisnis yang profesional,
                  akuntabel, dan mandiri dalam mendukung kemajuan UIN Raden
                  Fatah menuju World Class University.&quot;
                </p>
              </div>
            </FadeIn>

            <FadeIn direction="left" delay={0.4}>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" /> Misi
                </h3>
                <ul className="space-y-4">
                  {[
                    "Mengelola aset universitas secara profesional dan transparan.",
                    "Meningkatkan pendapatan melalui unit usaha strategis.",
                    "Menyediakan layanan fasilitas prima bagi civitas akademika dan masyarakat umum.",
                    "Membangun kemitraan strategis dengan dunia usaha dan industri.",
                  ].map((item, idx) => (
                    <li key={idx} className="flex gap-3 text-slate-600">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2.5 shrink-0"></span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}