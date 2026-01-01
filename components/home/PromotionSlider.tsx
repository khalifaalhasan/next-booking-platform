"use client";

import React, { useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Definisikan Tipe Data
export type Promotion = {
  id: string;
  title: string | null;
  image_url: string;
  link_url: string | null;
};

interface PromotionSliderProps {
  banners: Promotion[];
}

export default function PromotionSlider({ banners }: PromotionSliderProps) {
  // Config Carousel: Loop = true, Autoplay = 4 detik
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!banners || banners.length === 0) {
    // Fallback jika tidak ada banner (bisa return null atau placeholder statis)
    return null;
  }

  return (
    <div className="relative group rounded-2xl overflow-hidden shadow-xl border border-gray-100">
      {/* Container Utama Embla */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="relative flex-[0_0_100%] min-w-0" // 1 Slide = 100% width
            >
              {/* ASPECT RATIO LOCK 
                  aspect-[2.4/1] artinya Lebar 2.4 : Tinggi 1.
                  Desainer wajib export gambar ukuran: 1200x500px (atau kelipatannya)
              */}
              <div className="relative w-full aspect-[2.4/1] bg-gray-100">
                {banner.link_url ? (
                  <a href={banner.link_url} className="block w-full h-full">
                    <BannerImage banner={banner} />
                  </a>
                ) : (
                  <BannerImage banner={banner} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons (Muncul saat hover di Desktop) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button
          variant="secondary"
          size="icon"
          className="pointer-events-auto h-8 w-8 md:h-10 md:w-10 rounded-full shadow-lg bg-white/80 hover:bg-white backdrop-blur-sm"
          onClick={scrollPrev}
        >
          <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 text-gray-800" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="pointer-events-auto h-8 w-8 md:h-10 md:w-10 rounded-full shadow-lg bg-white/80 hover:bg-white backdrop-blur-sm"
          onClick={scrollNext}
        >
          <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-gray-800" />
        </Button>
      </div>
    </div>
  );
}

// Sub-component agar kode lebih rapi
function BannerImage({ banner }: { banner: Promotion }) {
  return (
    <Image
      src={banner.image_url}
      alt={banner.title || "Promotion Banner"}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
      priority={true} // Banner atas wajib priority agar LCP bagus
    />
  );
}
