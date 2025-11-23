import { createClient } from "@/utils/supabase/server";
import BookingForm from "@/app/(main)/services/[slug]/BookingForm";
import Link from "next/link";

// Props sekarang menerima slug langsung (String), bukan params object
interface DetailServiceProps {
  slug: string;
}

export default async function ServiceDetailPage({ slug }: DetailServiceProps) {
  const supabase = await createClient();

  console.log("✅ [DETAIL COMPONENT] Mencari data untuk slug:", slug);

  const { data: service, error } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .single();

  // === DEBUG VIEW (KOTAK MERAH) ===
  // Jika error atau data kosong, kita TAMPILKAN ERRORNYA, jangan 404.
  if (error || !service) {
    return (
      <div className="container mx-auto p-10 mt-10 border-2 border-red-500 bg-red-50 rounded-xl text-red-900">
        <h1 className="text-3xl font-bold mb-4">
          ⚠️ DEBUG MODE: ERROR DETECTED
        </h1>

        <div className="grid gap-4">
          <div className="bg-white p-4 rounded shadow">
            <strong>Slug yang dicari:</strong>
            <p className="text-xl font-mono text-blue-600">
              {slug ? `"${slug}"` : "UNDEFINED (KOSONG!)"}
            </p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <strong>Error dari Database:</strong>
            <pre className="text-sm bg-gray-900 text-green-400 p-3 rounded mt-2 overflow-auto">
              {error
                ? JSON.stringify(error, null, 2)
                : "Tidak ada error dari Supabase (Query sukses tapi data kosong)"}
            </pre>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <strong>Isi Data Service:</strong>
            <pre className="text-sm bg-gray-900 text-yellow-400 p-3 rounded mt-2">
              {service === null ? "NULL (Data tidak ditemukan)" : "Data ada"}
            </pre>
          </div>
        </div>

        <p className="mt-6 font-bold">SOLUSI MUNGKIN:</p>
        <ul className="list-disc ml-5">
          <li>
            Jika Error Code <strong>PGRST116</strong>: Data kosong. Cek apakah
            slug di URL sama persis dengan di Table database?
          </li>
          <li>
            Jika Error Code <strong>42501</strong>: RLS Error. Jalankan query
            SQL permission di dashboard Supabase.
          </li>
          <li>
            Jika Slug <strong>UNDEFINED</strong>: Masalah di `page.tsx` belum
            await params.
          </li>
        </ul>
      </div>
    );
  }
  // === END DEBUG VIEW ===

  // --- TAMPILAN NORMAL (Hanya jalan jika data ada) ---
  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        /
        <Link href="/services" className="hover:underline mx-1">
          Services
        </Link>{" "}
        /<span className="text-gray-800 font-medium">{service.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Kolom Kiri */}
        <div className="lg:col-span-2 space-y-8">
          <div className="aspect-video w-full bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            {service.images && service.images.length > 0 ? (
              <img
                src={service.images[0]}
                alt={service.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No Image
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {service.name}
            </h1>
            <p className="text-2xl font-bold text-blue-600">
              {formatRupiah(service.price)} / {service.unit}
            </p>
          </div>
          <div className="prose max-w-none text-gray-600">
            <p>{service.description}</p>
          </div>
          {/* Spesifikasi */}
          {service.specifications && (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 grid grid-cols-2 gap-4">
              {Object.entries(
                service.specifications as Record<string, any>
              ).map(([key, value]) => (
                <div key={key}>
                  <span className="text-xs text-gray-400 uppercase font-bold">
                    {key.replace(/_/g, " ")}
                  </span>
                  <span className="block font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kolom Kanan */}
        <div className="lg:col-span-1">
          <BookingForm service={service} />
        </div>
      </div>
    </div>
  );
}
