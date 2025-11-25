import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import ServiceHeader from "@/components/Service/ServiceHeader";
import { notFound } from "next/navigation";

interface DetailServiceProps {
  slug: string;
}

export default async function ServiceDetailPage({ slug }: DetailServiceProps) {
  const supabase = await createClient();

  // 1. Fetch Service
  const { data: service, error } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !service) {
    notFound();
  }

  // 2. Fetch Existing Bookings (Untuk disable tanggal di kalender)
  // Ambil booking yg statusnya confirmed/waiting/pending, dan belum lewat hari ini
  const { data: bookings } = await supabase
    .from("bookings")
    .select("start_time, end_time")
    .eq("service_id", service.id)
    .neq("status", "cancelled")
    .gte("end_time", new Date().toISOString()); // Hanya ambil yg masa depan

  // Helper format
  const formatRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  return (
    <div className="min-h-screen bg-white">
      {/* 1. STICKY HEADER / SEARCH BAR (Pengganti Booking Form Lama) */}
      <ServiceHeader service={service} existingBookings={bookings || []} />

      {/* 2. KONTEN UTAMA */}
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:underline text-blue-600">
            Home
          </Link>{" "}
          /<span className="mx-1 text-gray-400">Hotel di Indonesia</span> /
          <span className="mx-1 text-gray-800 font-medium">{service.name}</span>
        </div>

        {/* HERO SECTION: GRID GAMBAR TRAVELOKA STYLE */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] rounded-xl overflow-hidden mb-8">
          {/* Gambar Utama (Besar Kiri) */}
          <div className="col-span-2 row-span-2 relative group cursor-pointer">
            {service.images?.[0] ? (
              <img
                src={service.images[0]}
                className="w-full h-full object-cover group-hover:brightness-90 transition"
                alt="Main"
              />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
          </div>

          {/* Gambar Kecil Kanan Atas 1 */}
          <div className="col-span-1 row-span-1 relative group cursor-pointer">
            {service.images?.[1] ? (
              <img
                src={service.images[1]}
                className="w-full h-full object-cover group-hover:brightness-90 transition"
                alt="Gal 1"
              />
            ) : (
              <div className="w-full h-full bg-gray-100" />
            )}
          </div>

          {/* Gambar Kecil Kanan Atas 2 */}
          <div className="col-span-1 row-span-1 relative group cursor-pointer">
            {service.images?.[2] ? (
              <img
                src={service.images[2]}
                className="w-full h-full object-cover group-hover:brightness-90 transition"
                alt="Gal 2"
              />
            ) : (
              <div className="w-full h-full bg-gray-100" />
            )}
          </div>

          {/* Gambar Kecil Kanan Bawah 1 */}
          <div className="col-span-1 row-span-1 relative group cursor-pointer">
            {service.images?.[3] ? (
              <img
                src={service.images[3]}
                className="w-full h-full object-cover group-hover:brightness-90 transition"
                alt="Gal 3"
              />
            ) : (
              <div className="w-full h-full bg-gray-100" />
            )}
          </div>

          {/* Gambar Kecil Kanan Bawah 2 (See All) */}
          <div className="col-span-1 row-span-1 relative group cursor-pointer">
            {service.images?.[0] ? (
              <img
                src={service.images[0]}
                className="w-full h-full object-cover blur-[2px] brightness-50"
                alt="More"
              />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold underline">
              Lihat Semua Foto
            </div>
          </div>
        </div>

        {/* INFO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* KOLOM KIRI (Info Detail) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                  Hotel
                </span>
                <span className="flex text-yellow-400 text-sm">★★★★☆</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {service.name}
              </h1>
              <p className="text-gray-500 flex items-center gap-1">
                📍{" "}
                {service.unit === "per_day"
                  ? "Jakarta, Indonesia"
                  : "Lokasi Aset"}
                <span className="text-blue-600 cursor-pointer text-sm font-semibold ml-2">
                  Lihat Peta
                </span>
              </p>
            </div>

            <hr />

            {/* Fasilitas Utama */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Fasilitas Utama
              </h3>
              <div className="flex gap-6 text-gray-600 text-sm">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl">❄️</span> <span>AC</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl">🍽️</span> <span>Restoran</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl">🏊</span> <span>Kolam Renang</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl">📶</span> <span>WiFi 24 Jam</span>
                </div>
              </div>
            </div>

            <hr />

            {/* Deskripsi */}
            <div className="prose max-w-none text-gray-600 leading-relaxed">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Tentang Akomodasi
              </h3>
              <p className="whitespace-pre-line">{service.description}</p>
            </div>

            {/* Spesifikasi Teknis */}
            {service.specifications && (
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">
                  Detail Spesifikasi
                </h3>
                <div className="grid grid-cols-2 gap-y-4">
                  {Object.entries(
                    service.specifications as Record<string, any>
                  ).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <span className="text-xs text-gray-400 uppercase font-semibold mb-1">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="text-gray-800 font-medium">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* KOLOM KANAN (Review / Summary - Opsional karena booking sudah di atas) */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm sticky top-28">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl font-bold text-blue-600">8.5</div>
                <div>
                  <p className="font-bold text-gray-900">Mengesankan</p>
                  <p className="text-sm text-gray-500">Dari 1,240 review</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 italic">
                  Pelayanan sangat ramah, kamar bersih, dan lokasi strategis.
                  <div className="mt-2 text-xs text-gray-400 font-bold">
                    - Budi S.
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 italic">
                  Worth the price! Fasilitas lengkap.
                  <div className="mt-2 text-xs text-gray-400 font-bold">
                    - Siti A.
                  </div>
                </div>
              </div>
              <button className="w-full mt-6 text-blue-600 font-bold text-sm border border-blue-600 rounded-full py-2 hover:bg-blue-50">
                Baca Semua Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
