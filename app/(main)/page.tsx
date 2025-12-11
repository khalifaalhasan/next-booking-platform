import { Suspense } from "react";
import dynamic from "next/dynamic";
import HeroSection from "@/components/home/HeroSection"; // Load biasa (LCP Optimization)

export const metadata = {
  title: "Pusat Bisnis UIN Raden Fatah",
  description:
    "Pusat Pengembangan Bisnis UIN Raden Fatah Palembang - Solusi lengkap untuk kebutuhan bisnis dan pengembangan usaha Anda.",
};
// Lazy Load komponen di bawah layar
const FeaturesSection = dynamic(
  () => import("@/components/home/FeaturesSection"),
  {
    loading: () => <div className="h-96 bg-white" />, // Placeholder
  }
);
const FeaturedServices = dynamic(
  () => import("@/components/home/FeaturedServices")
);
const BlogSection = dynamic(() => import("@/components/home/BlogSection"));
const CTASection = dynamic(() => import("@/components/home/CTASection"));

import SpinnerLoading from "@/components/ui/SpinnerLoading";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero langsung di-render agar cepat */}
      <HeroSection />

      {/* Sisanya di-stream saat user scroll */}
      <Suspense fallback={<SpinnerLoading />}>
        <FeaturesSection />
        <FeaturedServices />
        <BlogSection />
        <CTASection />
      </Suspense>
    </div>
  );
}
