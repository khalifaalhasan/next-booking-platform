import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import ServiceHeader from "@/components/service/ServiceHeader";
import { notFound } from "next/navigation";
import { Tables } from "@/types/supabase";
import Image from "next/image";
import { MapPin } from "lucide-react";

// 1. Definisikan Tipe Data
type ServiceWithCategory = Tables<"services"> & {
  categories: { name: string } | null;
};

export default async function ServiceDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const supabase = await createClient();
  const params = await props.params;

  if (!params || !params.slug) {
    return notFound();
  }

  const { slug } = params;

  // A. Fetch Service
  const { data: serviceData, error } = await supabase
    .from("services")
    .select(
      `
        *,
        categories ( name )
    `
    )
    .eq("slug", slug)
    .single();

  if (error || !serviceData) {
    return notFound();
  }

  const service = serviceData as unknown as ServiceWithCategory;

  // B. Fetch Bookings
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("service_id", service.id)
    .in("status", ["confirmed", "waiting_verification"])
    .gte("end_time", new Date().toISOString());

  return (
    <div className="min-h-screen bg-white font-sans pb-20">
      {/* Header dengan Date Picker */}
      <ServiceHeader service={service} existingBookings={bookings || []} />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-500 flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <Link href="/" className="hover:underline text-blue-600">
            Home
          </Link>{" "}
          /
          <span className="mx-1 text-gray-400">
            {service.categories?.name || "Layanan"}
          </span>{" "}
          /
          <span className="mx-1 text-gray-800 font-medium truncate max-w-[200px]">
            {service.name}
          </span>
        </div>

        {/* --- GRID GAMBAR RESPONSIF --- */}
        {/* Mobile: 1 Gambar Besar dengan scroll horizontal / slider sederhana */}
        {/* Desktop: Grid 4 kolom seperti Airbnb/Traveloka */}
        <div className="relative rounded-xl overflow-hidden mb-8 shadow-sm">
          {/* Tampilan Desktop & Tablet (Grid) */}
          <div className="hidden md:grid md:grid-cols-4 md:grid-rows-2 gap-2 h-[400px]">
            <div className="col-span-2 row-span-2 relative group cursor-pointer overflow-hidden">
              {service.images?.[0] ? (
                <Image
                  src={service.images[0]}
                  alt={service.name}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-500"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
            <div className="col-span-1 row-span-1 relative group cursor-pointer overflow-hidden">
              {service.images?.[1] ? (
                <Image
                  src={service.images[1]}
                  alt="Gal 1"
                  fill
                  className="object-cover group-hover:scale-105 transition duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gray-100" />
              )}
            </div>
            <div className="col-span-1 row-span-1 relative group cursor-pointer overflow-hidden rounded-tr-xl">
              {service.images?.[2] ? (
                <Image
                  src={service.images[2]}
                  alt="Gal 2"
                  fill
                  className="object-cover group-hover:scale-105 transition duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gray-100" />
              )}
            </div>
            <div className="col-span-1 row-span-1 relative group cursor-pointer overflow-hidden">
              {service.images?.[3] ? (
                <Image
                  src={service.images[3]}
                  alt="Gal 3"
                  fill
                  className="object-cover group-hover:scale-105 transition duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gray-100" />
              )}
            </div>
            <div className="col-span-1 row-span-1 relative group cursor-pointer overflow-hidden rounded-br-xl">
              {service.images?.[0] ? (
                <Image
                  src={service.images[0]}
                  alt="More"
                  fill
                  className="object-cover blur-[2px] brightness-50 transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold underline text-sm md:text-base drop-shadow-md cursor-pointer">
                Lihat Semua Foto
              </div>
            </div>
          </div>

          {/* Tampilan Mobile (Aspect Ratio Landscape 16:9) */}
          <div className="md:hidden w-full aspect-video relative rounded-xl overflow-hidden shadow-sm">
            {service.images?.[0] ? (
              <Image
                src={service.images[0]}
                alt={service.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
            {/* Indikator foto (misal 1/5) */}
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
              1 / {service.images?.length || 0} Foto
            </div>
          </div>
        </div>

        {/* --- INFO SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* KOLOM KIRI: DESKRIPSI (8 Kolom) */}
          <div className="lg:col-span-8 space-y-8">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-blue-100">
                  {service.categories?.name || "Umum"}
                </span>
                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                  <span className="text-yellow-500 text-sm">★</span>
                  <span className="text-xs font-bold text-yellow-700">
                    4.8 (120 Review)
                  </span>
                </div>
              </div>

              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                {service.name}
              </h1>

              <p className="text-gray-500 flex items-center gap-2 text-sm md:text-base">
                <MapPin className="h-5 w-5 text-gray-400 shrink-0" />
                <span>
                  {service.unit === "per_day"
                    ? "Lokasi Utama (Pusat)"
                    : "Lokasi Aset"}
                </span>
                <span className="text-blue-600 cursor-pointer font-semibold ml-1 hover:underline">
                  Lihat Peta
                </span>
              </p>
            </div>

            <div className="h-px bg-gray-100 w-full" />

            <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed text-sm md:text-base">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
                Tentang Layanan Ini
              </h3>
              <p className="whitespace-pre-line">{service.description}</p>
            </div>

            {service.specifications && (
              <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider flex items-center gap-2">
                  <span>📋</span> Detail Spesifikasi
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                  {Object.entries(
                    service.specifications as Record<string, string | number>
                  ).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex flex-col border-b border-slate-200 pb-3 last:border-0"
                    >
                      <span className="text-xs text-slate-500 uppercase font-semibold mb-1 tracking-wide">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="text-slate-800 font-medium text-base">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* KOLOM KANAN: REVIEW SUMMARY (4 Kolom Sticky) */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm lg:sticky lg:top-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-blue-600 text-white rounded-xl px-4 py-3 text-center min-w-[70px] shadow-lg shadow-blue-200">
                  <div className="text-2xl font-bold">8.5</div>
                  <div className="text-[10px] font-medium uppercase tracking-wider">
                    Hebat
                  </div>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">Ulasan Tamu</p>
                  <p className="text-sm text-gray-500">
                    Berdasarkan 1,240 review asli
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 italic border border-gray-100">
                  &quot;Pelayanan sangat ramah, tempat bersih dan nyaman.&quot;{" "}
                  <div className="mt-2 text-xs text-gray-400 font-bold not-italic uppercase tracking-wide">
                    - Budi Santoso
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 italic border border-gray-100">
                  &quot;Harga sangat worth it untuk fasilitas segini.&quot;{" "}
                  <div className="mt-2 text-xs text-gray-400 font-bold not-italic uppercase tracking-wide">
                    - Siti Aminah
                  </div>
                </div>
              </div>

              <button className="w-full text-blue-600 font-bold text-sm border border-blue-200 bg-blue-50/50 rounded-xl py-3.5 hover:bg-blue-50 hover:border-blue-300 transition active:scale-[0.98]">
                Baca Semua Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
