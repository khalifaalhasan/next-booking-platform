import Link from "next/link";
import { Button } from "@/components/ui/button";
import FadeIn from "@/components/ui/FadeIn";

export default function CTASection() {
  return (
    <section className="py-20">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up" delay={0.2}>
          <div className="bg-blue-600 rounded-3xl p-8 md:p-16 text-center md:text-left relative overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Siap Mengembangkan Bisnis Anda?
                </h2>
                <p className="text-blue-100 text-lg mb-0">
                  Bergabunglah dengan ribuan mitra dan pelanggan yang telah
                  mempercayakan kebutuhan aset bisnis mereka kepada kami.
                </p>
              </div>
              <div className="flex gap-4 shrink-0">
                <Link href="/services">
                  <Button className="h-14 px-8 bg-white text-blue-600 hover:bg-blue-50 text-lg font-bold rounded-full shadow-xl transition transform hover:scale-105">
                    Daftar Sekarang
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}