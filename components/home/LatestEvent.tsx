import { createClient } from "@/utils/supabase/server";
import { ArrowRight, CalendarDays } from "lucide-react";
import Link from "next/link";
import EventGrid from "@/components/events/EventGrid"; // Kita reuse grid yang sudah ada
import { Tables } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import SectionHeader from "../ui/SectionHeader";

export default async function LatestEvents() {
  const supabase = await createClient();

  // Ambil 3 event terbaru yang aktif
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("is_active", true)
    .order("event_date", { ascending: false }) // Event masa depan/terbaru di atas
    .limit(3);

  const typedEvents = (events as unknown as Tables<"events">[]) || [];

  // Jika tidak ada event, tidak perlu render section ini
  if (typedEvents.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Agenda Kami"
          subtitle="Jangan lewatkan berbagai kegiatan, workshop, dan seminar menarik
              dari UPT Pengembangan Bisnis."
          badge="Agenda Terbaru"
          action={{ href: "/events", label: "Lihat Semua Agenda" }}
        />

        {/* Reuse Component Grid */}
        <EventGrid events={typedEvents} />
      </div>
    </section>
  );
}
