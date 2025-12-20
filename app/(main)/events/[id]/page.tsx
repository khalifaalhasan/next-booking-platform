import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Update Interface untuk mendukung Next.js 15 (Promise) dan Next.js 14
interface EventDetailPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const supabase = await createClient();

  // 1. Tangani Params (Safe untuk Next.js 15 & 14)
  // Kita coba await dulu, jika gagal berarti itu object biasa (Next 14)
  let id = "";
  try {
    const resolvedParams = await params;
    id = resolvedParams.id;
  } catch (e) {
    // Fallback untuk Next.js versi lama jika await error (jarang terjadi)
    id = (params as { id: string }).id;
  }

  // Debugging: Cek ID di Terminal VS Code
  console.log("🔍 Mengecek Event ID:", id);

  // 2. Validasi UUID Sederhana (Mencegah error database jika ID aneh)
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (!isValidUUID) {
    console.error("❌ ID bukan UUID yang valid");
    notFound();
  }

  // 3. Ambil data detail
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  // 4. Cek Error Database
  if (error) {
    console.error("❌ Supabase Error:", error.message);
    console.error("Detail Error:", error);
    notFound();
  }

  if (!event) {
    console.error("❌ Event tidak ditemukan (Data Kosong)");
    notFound();
  }

  console.log("✅ Event Ditemukan:", event.title);

  // Helper formatting
  const eventDate = new Date(event.event_date || "");
  const isFinished = eventDate < new Date();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HEADER IMAGE / BANNER */}
      <div className="relative w-full h-[300px] md:h-[400px] bg-slate-900">
        {event.thumbnail_url ? (
          <Image
            src={event.thumbnail_url}
            alt={event.title}
            fill
            className="object-cover opacity-60"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white/20">
            <Calendar className="w-24 h-24" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
        
        {/* Back Button Overlay */}
        <div className="absolute top-6 left-4 md:left-8 z-20">
          <Link href="/events">
            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md gap-2">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
            </Button>
          </Link>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={isFinished ? "bg-slate-500" : "bg-blue-600 hover:bg-blue-700"}>
                        {isFinished ? "Selesai" : "Akan Datang"}
                    </Badge>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight shadow-sm">
                    {event.title}
                </h1>
            </div>
        </div>
      </div>

      {/* CONTENT INFO */}
      <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-20">
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 md:p-10">
          
          {/* Info Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 border-b border-slate-100 pb-8">
            <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                    <Calendar className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Tanggal</p>
                    <p className="text-slate-900 font-semibold">
                        {eventDate.toLocaleDateString("id-ID", {
                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                        })}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="bg-orange-50 p-3 rounded-full text-orange-600">
                    <Clock className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Waktu</p>
                    <p className="text-slate-900 font-semibold">
                        {eventDate.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} WIB
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="bg-red-50 p-3 rounded-full text-red-600">
                    <MapPin className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Lokasi</p>
                    <p className="text-slate-900 font-semibold">
                        {event.location || "Online / Menunggu Info"}
                    </p>
                </div>
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-slate max-w-none prose-lg">
             <h3 className="text-xl font-bold text-slate-800 mb-4">Deskripsi Acara</h3>
             <p className="whitespace-pre-line text-slate-600 leading-relaxed">
                {event.description || "Tidak ada deskripsi detail."}
             </p>
          </div>

        </div>
      </div>
    </div>
  );
}