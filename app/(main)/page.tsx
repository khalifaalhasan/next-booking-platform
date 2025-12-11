import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server"; // Import ini
import dynamic from "next/dynamic";
import HeroSection from "@/components/home/HeroSection";
import SpinnerLoading from "@/components/ui/SpinnerLoading";
import LeadersGreeting from "@/components/home/LeadersGreeting";
import FAQSection from "@/components/home/FAQSection";

// ... Import Lazy Load lainnya
const FeaturesSection = dynamic(
  () => import("@/components/home/FeaturesSection")
);
const FeaturedServices = dynamic(
  () => import("@/components/home/FeaturedServices")
);
const BlogSection = dynamic(() => import("@/components/home/BlogSection")); // Pastikan ini
const CTASection = dynamic(() => import("@/components/home/CTASection"));

export default async function Home() {
  const supabase = await createClient();

  // FETCH DATA BLOG (Terbaru & Published)
  // Limit 5 agar slider bisa discroll
  const { data: latestPosts } = await supabase
    .from("posts")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="min-h-screen bg-white font-sans">
      <HeroSection />

      <Suspense fallback={<SpinnerLoading />}>
        <LeadersGreeting />
        <FeaturesSection />
        <FeaturedServices />

        {/* Pass data posts ke sini */}
        <BlogSection posts={latestPosts || []} />

        <FAQSection />
        <CTASection />
      </Suspense>
    </div>
  );
}
