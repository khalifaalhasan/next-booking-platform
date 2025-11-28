"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Building2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    // PERBAIKAN 1: Kurangi padding atas (pt) dan bawah (pb)
    <section className="relative pt-10 pb-0 md:pt-20 overflow-hidden bg-white">
      {/* Background Pattern (Dot) */}
      <div className="absolute inset-0 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

      {/* Gradient Glow (Diperkecil sedikit opacity-nya) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-100/40 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="container relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* 1. Badge (Margin bottom dikurangi) */}
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

        {/* 2. Headline (Font size dikurangi agar tidak raksasa) */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          // PERBAIKAN 2: Ubah text-7xl jadi text-5xl/6xl
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4"
        >
          Pusat Pengembangan Bisnis <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Mudah, Cepat & Transparan
          </span>
        </motion.h1>

        {/* 3. Subheadline (Margin dikurangi) */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          Platform satu pintu untuk penyewaan gedung, kendaraan, dan peralatan
          penunjang kegiatan akademik maupun umum. Booking sekarang tanpa ribet.
        </motion.p>

        {/* 4. Buttons (Margin bottom dikurangi) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12"
        >
          <Link href="/services">
            <Button className="h-12 px-8 rounded-full text-base font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all transform hover:-translate-y-1">
              <Sparkles className="w-4 h-4 mr-2 fill-white/20" />
              Cari Layanan & Booking
            </Button>
          </Link>
          <Link href="/about">
            <Button
              variant="outline"
              className="h-12 px-8 rounded-full text-base font-medium border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all"
            >
              Tentang Kami
            </Button>
          </Link>
        </motion.div>

        {/* 5. Floating Image (Aspek Rasio diperlebar agar tidak terlalu tinggi) */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
          className="relative mx-auto max-w-5xl"
        >
          <div className="relative rounded-t-2xl border-x border-t border-slate-200 bg-white/50 p-2 shadow-2xl backdrop-blur-sm">
            {/* PERBAIKAN 3: aspect ratio 21/9 (Ultrawide) agar gambar lebih pipih/pendek */}
            <div className="relative rounded-t-xl overflow-hidden aspect-[16/10] md:aspect-[21/9]">
              {/* Pastikan src gambar valid. Jika error, ganti dengan placeholder dulu */}
              <Image
                src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2000&auto=format&fit=crop"
                alt="Fasilitas UIN Raden Fatah"
                fill
                className="object-cover object-center"
                priority
              />
              {/* Overlay halus */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>

          {/* Floating Badge Kiri */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="absolute -top-4 -left-4 md:top-6 md:-left-8 bg-white p-3 rounded-xl shadow-lg border border-slate-100 hidden md:flex items-center gap-3"
          >
            <div className="bg-green-100 p-2 rounded-full text-green-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Status
              </p>
              <p className="text-sm font-bold text-slate-800">Siap Booking</p>
            </div>
          </motion.div>

          {/* Floating Badge Kanan */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute -top-4 -right-4 md:top-12 md:-right-8 bg-white p-3 rounded-xl shadow-lg border border-slate-100 hidden md:flex items-center gap-3"
          >
            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Aset
              </p>
              <p className="text-sm font-bold text-slate-800">50+ Fasilitas</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
