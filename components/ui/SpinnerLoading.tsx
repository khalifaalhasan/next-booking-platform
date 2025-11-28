"use client";

import { Building2 } from "lucide-react";
import { usePathname } from "next/navigation";
import branding from "@/config/branding.json"; // Pastikan path branding benar

export default function SpinnerLoading() {
  const pathname = usePathname();

  // Logic untuk menentukan teks berdasarkan URL
  const getLoadingText = () => {
    if (!pathname) return branding.brand.shortName;

    // Cek URL dan kembalikan teks yang sesuai
    if (pathname === "/") return "Halaman Utama";
    if (pathname.startsWith("/services")) return "Menyiapkan Layanan";
    if (pathname.startsWith("/book")) return "Memproses Booking";
    if (pathname.startsWith("/payment")) return "Halaman Pembayaran";
    if (pathname.startsWith("/dashboard")) return "Dashboard User";
    if (pathname.startsWith("/admin")) return "Dashboard Admin";
    if (pathname.startsWith("/about")) return "Tentang Kami";
    if (pathname.startsWith("/blog")) return "Memuat Artikel";
    if (pathname.startsWith("/promo")) return "Mencari Promo";
    if (pathname.startsWith("/login") || pathname.startsWith("/register"))
      return "Otentikasi";

    // Default Text jika route tidak dikenali
    return branding.brand.shortName;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-[2px]">
      <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300 zoom-in-95">
        {/* Wrapper Spinner */}
        <div className="relative flex items-center justify-center">
          {/* Lingkaran Luar (Spinning) */}
          <div className="h-20 w-20 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600 shadow-lg" />

          {/* Icon Tengah (Static/Pulse) */}
          <div className="absolute">
            <div className="bg-white p-2 rounded-full shadow-sm">
              <Building2 className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Teks Loading Dinamis */}
        <div className="text-center space-y-1">
          <p className="text-lg font-bold text-gray-800 tracking-tight capitalize">
            {getLoadingText()}
          </p>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest animate-pulse">
            Mohon Tunggu...
          </p>
        </div>
      </div>
    </div>
  );
}
