import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn"; // Import Wrapper
import { Button } from "@/components/ui/button";
import SectionHeader from "../ui/SectionHeader";
import ArrowLink from "../ui/ArrowLink";

const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

export default async function FeaturedServices() {
  const supabase = await createClient();
  const { data: featuredServices } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .limit(3)
    .order("created_at", { ascending: false });

  return (
    <section className="py-20 bg-slate-50/50 border-y border-slate-100">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Layanan Unggulan"
          subtitle="Pilihan favorit minggu ini untuk kebutuhan bisnis Anda."
          badge="Layanan kami"
          action={{ href: "/services", label: "Lihat Semua Layanan" }}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredServices?.map((service, idx) => (
            // Bungkus setiap item dengan FadeIn + Delay bertingkat
            <FadeIn key={service.id} delay={idx * 0.1} className="h-full">
              <Link
                href={`/services/${service.slug}`}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
              >
                <div className="relative h-56 w-full bg-slate-200 overflow-hidden">
                  {service.images && service.images[0] ? (
                    <Image
                      src={service.images[0]}
                      alt={service.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
                    {service.unit === "per_day" ? "Harian" : "Per Jam"}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-1 text-yellow-500 mb-2 text-xs font-bold">
                    <Star className="w-3 h-3 fill-current" /> 4.8 (Review)
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition">
                    {service.name}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-grow">
                    {service.description}
                  </p>
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-auto">
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold">
                        Mulai Dari
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatRupiah(service.price)}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/services">
            <Button variant="outline" className="w-full">
              Lihat Semua Layanan
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
