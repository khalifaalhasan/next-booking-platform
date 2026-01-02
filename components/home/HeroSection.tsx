"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import PromotionSlider, { Promotion } from "./PromotionSlider";

interface HeroSectionProps {
  banners: Promotion[];
}

export default function HeroSection({ banners }: HeroSectionProps) {
  // Logic: Tampilkan slider HANYA jika data banners ada isinya
  const hasActivePromos = banners && banners.length > 0;

  return (
    <section className="relative pt-10 pb-10 md:pt-20 md:pb-16 overflow-hidden bg-white">
      {/* --- DECORATION (Background Pattern & Glow) --- */}
      <div className="absolute inset-0 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-100/40 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="container relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* --- HEADER CONTENT (Text & Buttons) --- */}
        <HeroHeader />

        {/* --- DYNAMIC HERO BANNER AREA --- */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
          className="relative mx-auto max-w-5xl mt-12"
        >
          {/* Container Frame */}
          <div className="relative rounded-2xl border border-slate-200 bg-white shadow-2xl p-1 md:p-2">
            {hasActivePromos ? (
              // OPTION A: Dynamic Slider (Data dari Database)
              <PromotionSlider banners={banners} />
            ) : (
              // OPTION B: Rich Static Fallback (Data Lokal)
              <StaticHeroFallback />
            )}
          </div>

          {/* Floating Badges */}
        </motion.div>
      </div>
    </section>
  );
}

// --- SUB-COMPONENTS (Agar Main Component Bersih/Clean) ---

function StaticHeroFallback() {
  return (
    // Aspect Ratio 2.4/1 dikunci agar sama persis dengan Slider
    <div className="relative w-full aspect-[2.4/1] rounded-xl overflow-hidden bg-slate-900 group">
      {/* 1. Local Image (Performance: High) */}
      <Image
        src="/images/hero-fallback.png" // Pastikan file ini ada di folder public/images
        alt="Gedung Pusat Pengembangan Bisnis UIN Raden Fatah"
        fill
        className="object-cover object-center opacity-90 transition-transform duration-700 group-hover:scale-105"
        priority={true} // Wajib priority untuk LCP (SEO Score)
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
      />

      {/* 2. Gradient Overlay (Readability) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

      {/* 3. Static Copywriting (Engagement) */}
      <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 text-left">
        <span className="inline-block px-3 py-1 mb-3 text-[10px] md:text-xs font-bold text-white bg-blue-600 rounded-full shadow-lg">
          WELCOME TO P2B
        </span>
        <h3 className="text-white text-xl md:text-3xl font-bold leading-tight mb-2 drop-shadow-md">
          Fasilitas Lengkap & Modern
        </h3>
        <p className="text-slate-200 text-xs md:text-sm max-w-lg leading-relaxed drop-shadow-sm line-clamp-2 md:line-clamp-none">
          Kami menyediakan berbagai venue eksklusif dan peralatan terbaik untuk
          menunjang kesuksesan kegiatan akademik maupun umum Anda.
        </p>
      </div>
    </div>
  );
}

function HeroHeader() {
  return (
    <>
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-blue-100 shadow-sm mb-6"
      >
        <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
        <span className="text-xs font-bold text-slate-600 tracking-wide uppercase">
          Sistem Reservasi Resmi{" "}
          <span className="text-blue-600">UIN Raden Fatah</span>
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4"
      >
        Pusat Pengembangan Bisnis <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
          UIN Raden Fatah Palembang
        </span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed"
      >
        Platform satu pintu untuk penyewaan gedung, kendaraan, dan peralatan
        penunjang kegiatan akademik maupun umum. Booking sekarang tanpa ribet.
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-3"
      >
        <Link href="/services">
          <Button className="h-12 px-8 rounded-full text-base font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all transform hover:-translate-y-1">
            <Sparkles className="w-4 h-4 mr-2 fill-white/20" />
            Cari Layanan & Booking
          </Button>
        </Link>
        <Link href="/catalogs">
          <Button
            variant="outline"
            className="h-12 px-8 rounded-full text-base font-medium border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all"
          >
            Lihat Katalog
          </Button>
        </Link>
      </motion.div>
    </>
  );
}
