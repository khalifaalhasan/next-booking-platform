import { Building2, Clock, ShieldCheck } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Animasi */}
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Kenapa Memilih Kami?
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Kami menyediakan ekosistem penyewaan aset yang transparan, mudah,
            dan aman untuk kebutuhan profesional Anda.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 - Delay 0s */}
          <FadeIn delay={0} className="h-full">
            <div className="p-8 h-full rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors group">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Terverifikasi & Aman
              </h3>
              <p className="text-slate-500 leading-relaxed">
                Semua aset dan layanan telah melalui proses verifikasi ketat untuk
                menjamin kualitas dan keamanan transaksi Anda.
              </p>
            </div>
          </FadeIn>

          {/* Card 2 - Delay 0.2s */}
          <FadeIn delay={0.2} className="h-full">
            <div className="p-8 h-full rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors group">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Booking Instan
              </h3>
              <p className="text-slate-500 leading-relaxed">
                Sistem booking realtime yang memungkinkan Anda mengecek
                ketersediaan dan melakukan reservasi dalam hitungan menit.
              </p>
            </div>
          </FadeIn>

          {/* Card 3 - Delay 0.4s */}
          <FadeIn delay={0.4} className="h-full">
            <div className="p-8 h-full rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors group">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Fasilitas Lengkap
              </h3>
              <p className="text-slate-500 leading-relaxed">
                Mulai dari gedung pertemuan besar hingga peralatan multimedia
                kecil, semua kebutuhan event bisnis tersedia.
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}