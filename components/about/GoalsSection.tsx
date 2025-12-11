"use client";

import { Building2, Award, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import FadeIn from "@/components/ui/FadeIn";
import SectionHeader from "@/components/ui/SectionHeader";

const goals = [
  {
    icon: <Building2 className="w-6 h-6 text-blue-600" />,
    title: "Optimalisasi Aset",
    desc: "Memastikan seluruh aset UIN Raden Fatah dimanfaatkan secara produktif dan bernilai guna.",
  },
  {
    icon: <Award className="w-6 h-6 text-blue-600" />,
    title: "Layanan Prima",
    desc: "Memberikan pelayanan penyewaan yang transparan, cepat, dan profesional bagi publik.",
  },
  {
    icon: <Target className="w-6 h-6 text-blue-600" />,
    title: "Pendapatan BLU",
    desc: "Meningkatkan kontribusi pendapatan negara bukan pajak (PNBP) untuk kemajuan kampus.",
  },
];

export default function GoalsSection() {
  return (
    <section className="py-16">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Tujuan Strategis"
          subtitle="Fokus utama kami dalam menjalankan amanah pengelolaan aset."
          badge="Goals"
          align="center"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          {goals.map((goal, idx) => (
            <FadeIn key={idx} delay={idx * 0.1} className="h-full">
              <Card className="h-full border-slate-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                <CardContent className="p-8 text-center flex flex-col items-center">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                    {goal.icon}
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">
                    {goal.title}
                  </h4>
                  <p className="text-slate-500 leading-relaxed">{goal.desc}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
