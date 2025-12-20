"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, ArrowRight, Clock } from "lucide-react";
import { Tables } from "@/types/supabase";
import { Badge } from "@/components/ui/badge";

type Event = Tables<"events">;

interface EventGridProps {
  events: Event[];
}

export default function EventGrid({ events }: EventGridProps) {
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Belum ditentukan";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit", minute: "2-digit",
    });
  };

  const isPast = (dateString: string | null) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {events.map((item) => {
        const finished = isPast(item.event_date);

        return (
          <Link 
            href={`/events/${item.id}`} // <-- INI CONFIG PARAM ID-NYA
            key={item.id} 
            className="block group h-full"
          >
            <div className="h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200 flex flex-col relative">
              
              {/* Thumbnail Area */}
              <div className="relative aspect-video bg-slate-100 overflow-hidden">
                {item.thumbnail_url ? (
                  <Image
                    src={item.thumbnail_url}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-slate-50 text-slate-300">
                    <Calendar className="w-16 h-16" />
                  </div>
                )}
                
                {/* Badge Status - Warna Solid */}
                <div className="absolute top-3 right-3 z-10">
                  {finished ? (
                    <Badge className="bg-slate-700 text-white hover:bg-slate-800 border-0">
                      Selesai
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-600 text-white hover:bg-blue-700 shadow-md border-0 animate-in fade-in">
                      Akan Datang
                    </Badge>
                  )}
                </div>
              </div>

              {/* Content Area */}
              <div className="p-5 flex flex-col flex-1">
                {/* Tanggal & Waktu */}
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold mb-3">
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${finished ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-700'}`}>
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(item.event_date)}
                  </div>
                  {item.event_date && (
                    <div className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTime(item.event_date)} WIB
                    </div>
                  )}
                </div>
                
                {/* Judul - Lebih Hitam & Besar */}
                <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                
                {/* Lokasi & Action */}
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="truncate max-w-[150px] font-medium">
                        {item.location || "Online"}
                    </span>
                  </div>
                  <div className="flex items-center text-blue-600 text-xs font-bold uppercase tracking-wide bg-blue-50 px-3 py-1.5 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    Detail <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </div>
              
              {/* Decorative Bottom Border on Hover */}
              <div className="h-1 w-0 bg-blue-600 transition-all duration-300 group-hover:w-full absolute bottom-0 left-0" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}