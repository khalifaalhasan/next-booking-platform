import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Tables } from "@/types/supabase";

// Helper Rupiah
const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

// Tipe Data dengan Relasi
type ServiceWithCategory = Tables<"services"> & {
  categories: { id: string; name: string; slug: string } | null;
};

type GroupedServices = {
  [categoryName: string]: ServiceWithCategory[];
};

export default async function ServicesPage() {
  const supabase = await createClient();

  // Fetch data services + Relasi Kategori
  const { data: servicesData, error } = await supabase
    .from("services")
    .select(
      `
      *,
      categories ( id, name, slug )
    `
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-20 text-center text-red-500 bg-red-50 rounded-lg mx-auto max-w-lg mt-10">
        Gagal memuat layanan. Silakan coba lagi nanti.
      </div>
    );
  }

  const services = servicesData as unknown as ServiceWithCategory[];

  // Grouping Services by Category Name
  const groupedServices: GroupedServices = services.reduce((acc, service) => {
    const catName = service.categories?.name || "Lainnya";
    if (!acc[catName]) {
      acc[catName] = [];
    }
    acc[catName].push(service);
    return acc;
  }, {} as GroupedServices);

  // Urutkan nama kategori secara alfabetis (opsional)
  const sortedCategories = Object.keys(groupedServices).sort();

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* CONTENT SECTION PER KATEGORI */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {services.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-400 text-lg">
              Belum ada layanan yang tersedia saat ini.
            </p>
          </div>
        ) : (
          sortedCategories.map((categoryName) => (
            <div
              key={categoryName}
              className="scroll-mt-24"
              id={categoryName.toLowerCase().replace(/\s+/g, "-")}
            >
              {/* Judul Kategori */}
              <div className="flex items-center gap-4 mb-8">
                <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {categoryName}
                </h2>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>

              {/* Grid Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                {groupedServices[categoryName].map((service) => (
                  <Link
                    href={`/services/${service.slug}`}
                    key={service.id}
                    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full"
                  >
                    {/* Image Section */}
                    <div className="relative h-52 w-full bg-gray-100 overflow-hidden">
                      {service.images && service.images.length > 0 ? (
                        <Image
                          src={service.images[0]}
                          alt={service.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">
                          No Image
                        </div>
                      )}

                      {/* Badge Unit */}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-blue-700 shadow-sm border border-blue-50">
                        {service.unit === "per_day" ? "Harian" : "Per Jam"}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 flex flex-col flex-grow">
                      {/* Nama */}
                      <h3
                        className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1"
                        title={service.name}
                      >
                        {service.name}
                      </h3>

                      {/* Deskripsi Singkat */}
                      <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow leading-relaxed">
                        {service.description}
                      </p>

                      {/* Footer Card */}
                      <div className="pt-4 border-t border-gray-50 flex justify-between items-end mt-auto">
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">
                            Mulai Dari
                          </p>
                          <p className="text-lg font-bold text-blue-600">
                            {formatRupiah(service.price)}
                          </p>
                        </div>

                        <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4"
                          >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
