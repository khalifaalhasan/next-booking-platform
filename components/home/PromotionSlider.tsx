"use client";

import React, { useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"; // Tambah icon Arrow
import { Button } from "@/components/ui/button";

// 1. Update Tipe Data
export type Promotion = {
  id: string;
  title: string | null; // Akan jadi Headline Besar
  description: string | null; // Akan jadi Subtext
  badge_text: string | null; // Badge kecil di atas judul
  image_url: string;
  link_url: string | null;
};

interface PromotionSliderProps {
  banners: Promotion[];
}

export default function PromotionSlider({ banners }: PromotionSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: true }), // Delay agak lama biar sempat baca
  ]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!banners || banners.length === 0) return null;

  return (
    <div className="relative group rounded-xl overflow-hidden shadow-sm bg-slate-900">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {banners.map((banner) => (
            <div key={banner.id} className="relative flex-[0_0_100%] min-w-0">
              {/* Aspect Ratio Lock 2.4:1 */}
              <div className="relative w-full aspect-[2.4/1]">
                {/* --- GAMBAR BACKGROUND --- */}
                <Image
                  src={banner.image_url}
                  alt={banner.title || "Banner Promosi"}
                  fill
                  className="object-cover object-center"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                />

                {/* --- GRADIENT OVERLAY (Wajib ada biar teks terbaca) --- */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                {/* --- TEKS KONTEN (Overlay) --- */}
                <div className="absolute bottom-0 left-0 w-full p-5 md:p-10 text-left z-10 flex flex-col items-start gap-2 md:gap-4">
                  {/* Badge Kecil */}
                  {banner.badge_text && (
                    <span className="inline-block px-2 py-1 md:px-3 md:py-1 text-[10px] md:text-xs font-bold text-white bg-blue-600 rounded-full shadow-lg backdrop-blur-md bg-opacity-90">
                      {banner.badge_text}
                    </span>
                  )}

                  <div className="max-w-3xl space-y-1 md:space-y-2">
                    {/* Judul Utama */}
                    {banner.title && (
                      <h3 className="text-white text-lg md:text-3xl lg:text-4xl font-bold leading-tight drop-shadow-lg">
                        {banner.title}
                      </h3>
                    )}

                    {/* Deskripsi */}
                    {banner.description && (
                      <p className="text-slate-200 text-xs md:text-base lg:text-lg leading-relaxed max-w-xl line-clamp-2 md:line-clamp-none drop-shadow-md">
                        {banner.description}
                      </p>
                    )}
                  </div>

                  {/* Tombol CTA (Jika ada link) */}
                  {banner.link_url && (
                    <a
                      href={banner.link_url}
                      className="mt-2 inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-white hover:text-blue-400 transition-colors group/link"
                    >
                      Selengkapnya
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                    </a>
                  )}
                </div>

                {/* --- KLIK AREA (Link Full Card - Opsional) --- */}
                {/* Jika ingin seluruh banner bisa diklik, uncomment ini: */}
                {/* {banner.link_url && (
                  <a href={banner.link_url} className="absolute inset-0 z-0" aria-label={`Lihat ${banner.title}`}></a>
                )} */}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons (Desktop Only) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
        <Button
          variant="secondary"
          size="icon"
          className="pointer-events-auto h-8 w-8 md:h-10 md:w-10 rounded-full shadow-lg bg-white/20 hover:bg-white text-white hover:text-slate-900 backdrop-blur-md border border-white/10"
          onClick={scrollPrev}
        >
          <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="pointer-events-auto h-8 w-8 md:h-10 md:w-10 rounded-full shadow-lg bg-white/20 hover:bg-white text-white hover:text-slate-900 backdrop-blur-md border border-white/10"
          onClick={scrollNext}
        >
          <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      </div>

      {/* Indikator Dots (Opsional, biar tau ada berapa slide) */}
      <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-20 flex gap-2">
        {banners.map((_, index) => (
          <div
            key={index}
            className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white/50"
          ></div>
        ))}
      </div>
    </div>
  );
}
