import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import dynamic from "next/dynamic";
import HeroSection from "@/components/home/HeroSection";
import SpinnerLoading from "@/components/ui/SpinnerLoading";
import LeadersGreeting from "@/components/home/LeadersGreeting";
import FAQSection from "@/components/home/FAQSection";
import LatestEvents from "@/components/home/LatestEvent";

// ... Import Lazy Load lainnya
const FeaturesSection = dynamic(
  () => import("@/components/home/FeaturesSection")
);
const FeaturedServices = dynamic(
  () => import("@/components/home/FeaturedServices")
);
const BlogSection = dynamic(() => import("@/components/home/BlogSection"));
const CTASection = dynamic(() => import("@/components/home/CTASection"));
export const revalidate = 60; // Revalidate setiap 60 detik

export default async function Home() {
  const supabase = await createClient();

  // Ambil waktu server saat ini dalam format ISO string
  const now = new Date().toISOString();

  // 1. QUERY BLOG (Tetap sama)
  const postQuery = supabase
    .from("posts")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(5);

  // 2. QUERY PROMOTION (UPDATE BEST PRACTICE)
  const bannerQuery = supabase
    .from("promotions")
    .select(
      "id, title, description, badge_text, image_url, link_url, start_date, end_date"
    )
    .eq("is_active", true) // 1. Harus Aktif secara manual
    .lte("start_date", now) // 2. Tanggal mulai <= Sekarang (Sudah mulai)
    .gte("end_date", now) // 3. Tanggal akhir >= Sekarang (Belum berakhir)
    .order("sort_order", { ascending: true });

  // 2. EKSEKUSI PARALEL (Jalankan kedua query bersamaan)
  const [{ data: latestPosts }, { data: banners }] = await Promise.all([
    postQuery,
    bannerQuery,
  ]);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Pass data banners ke HeroSection */}
      <HeroSection banners={banners || []} />

      <Suspense fallback={<SpinnerLoading />}>
        <LeadersGreeting />
        <FeaturesSection />
        <FeaturedServices />

        <LatestEvents />
        {/* Pass data posts ke BlogSection */}
        <BlogSection posts={latestPosts || []} />

        <FAQSection />
        <CTASection />
      </Suspense>
    </div>
  );
}
