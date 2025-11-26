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

// 2. Definisikan Props secara eksplisit
// Kita gunakan 'any' dulu di params untuk debugging, lalu kita casting manual
export default async function ServiceDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const supabase = await createClient();

  // --- PERBAIKAN UTAMA DI SINI ---
  // 1. Tunggu props.params (untuk Next.js 15)
  const params = await props.params;

  // 2. Cek apakah slug ada
  if (!params || !params.slug) {
    return notFound();
  }

  const { slug } = params;
  // -------------------------------

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
    .select("start_time, end_time")
    .eq("service_id", service.id)
    .in("status", ["confirmed", "waiting_verification"])
    .gte("end_time", new Date().toISOString());

  return (
    <div className="min-h-screen bg-white font-sans">
      <ServiceHeader service={service} existingBookings={bookings || []} />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-500 flex items-center gap-1">
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

        {/* Grid Gambar */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[300px] md:h-[400px] rounded-xl overflow-hidden mb-8">
          <div className="col-span-2 row-span-2 relative group cursor-pointer">
            {service.images?.[0] ? (
              <Image
                src={service.images[0]}
                alt={service.name}
                fill
                className="object-cover group-hover:brightness-90 transition duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>
          <div className="col-span-1 row-span-1 relative group cursor-pointer">
            {service.images?.[1] ? (
              <Image
                src={service.images[1]}
                alt="Gal 1"
                fill
                className="object-cover group-hover:brightness-90 transition duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gray-100" />
            )}
          </div>
          <div className="col-span-1 row-span-1 relative group cursor-pointer">
            {service.images?.[2] ? (
              <Image
                src={service.images[2]}
                alt="Gal 2"
                fill
                className="object-cover group-hover:brightness-90 transition duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gray-100" />
            )}
          </div>
          <div className="col-span-1 row-span-1 relative group cursor-pointer">
            {service.images?.[3] ? (
              <Image
                src={service.images[3]}
                alt="Gal 3"
                fill
                className="object-cover group-hover:brightness-90 transition duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gray-100" />
            )}
          </div>
          <div className="col-span-1 row-span-1 relative group cursor-pointer">
            {service.images?.[0] ? (
              <Image
                src={service.images[0]}
                alt="More"
                fill
                className="object-cover blur-[2px] brightness-50 transition duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold underline text-sm md:text-base drop-shadow-md">
              Lihat Semua Foto
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">
                  {service.categories?.name || "Umum"}
                </span>
                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded border border-yellow-100">
                  <span className="text-yellow-500 text-xs">★</span>
                  <span className="text-xs font-bold text-yellow-700">
                    4.8 (120 Review)
                  </span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
                {service.name}
              </h1>
              <p className="text-gray-500 flex items-center gap-1 text-sm">
                <MapPin className="h-4 w-4" />
                {service.unit === "per_day"
                  ? "Lokasi Utama (Pusat)"
                  : "Lokasi Aset"}
                <span className="text-blue-600 cursor-pointer font-semibold ml-2 hover:underline">
                  Lihat Peta
                </span>
              </p>
            </div>

            <div className="h-px bg-gray-100 w-full" />

            <div className="prose max-w-none text-gray-600 leading-relaxed text-sm md:text-base">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Tentang Layanan Ini
              </h3>
              <p className="whitespace-pre-line">{service.description}</p>
            </div>

            {service.specifications && (
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <span>📋</span> Detail Spesifikasi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  {Object.entries(
                    service.specifications as Record<string, any>
                  ).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex flex-col border-b border-slate-200 pb-2 last:border-0"
                    >
                      <span className="text-xs text-slate-500 uppercase font-semibold mb-1">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="text-slate-800 font-medium">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm sticky top-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-blue-600 text-white rounded-lg px-3 py-2 text-center min-w-[60px]">
                  <div className="text-2xl font-bold">8.5</div>
                  <div className="text-[10px] font-medium uppercase">Hebat</div>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Ulasan Tamu</p>
                  <p className="text-xs text-gray-500">
                    Berdasarkan 1,240 review asli
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 italic">
                  "Pelayanan sangat ramah, tempat bersih."{" "}
                  <div className="mt-2 text-xs text-gray-400 font-bold not-italic">
                    - Budi Santoso
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 italic">
                  "Harga sangat worth it."{" "}
                  <div className="mt-2 text-xs text-gray-400 font-bold not-italic">
                    - Siti Aminah
                  </div>
                </div>
              </div>
              <button className="w-full mt-6 text-blue-600 font-bold text-sm border border-blue-200 bg-blue-50 rounded-lg py-3 hover:bg-blue-100 transition">
                Baca Semua Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
