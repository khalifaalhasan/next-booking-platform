import { createClient } from "@/utils/supabase/server";
import { CalendarDays } from "lucide-react";
import EventGrid from "@/components/events/EventGrid";
import { Tables } from "@/types/supabase";
import PageHeader from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const supabase = await createClient();

  // Ambil event yang statusnya AKTIF
  // Urutkan dari tanggal acara terbaru ke terlama (DESC)
  // Atau jika ingin yang akan datang duluan: .order('event_date', { ascending: true })
  // Kita pakai DESC agar event terbaru/masa depan muncul di atas jika datanya future,
  // tapi biasanya orang ingin melihat yang "paling dekat" di atas.
  // Strategi terbaik: Ambil semua, nanti UI yang menandai selesai/belum.

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("is_active", true)
    .order("event_date", { ascending: false }); // Event terbaru (tanggal besar) di atas

  const typedEvents = (events as unknown as Tables<"events">[]) || [];

  return (
    <div>
      {/* Header Section */}
      <PageHeader
        title="Agenda & Kegiatan"
        description="Informasi jadwal workshop, seminar, dan kegiatan terbaru di UPT
            Pengembangan Bisnis."
      />
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Content */}
          {typedEvents.length > 0 ? (
            <EventGrid events={typedEvents} />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
              <CalendarDays className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">Belum ada agenda kegiatan.</p>
              <p className="text-sm">Nantikan update terbaru dari kami.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
