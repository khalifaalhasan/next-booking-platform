import { Metadata } from "next";
import Link from "next/link";
import {
  HelpCircle,
  CalendarCheck,
  CreditCard,
  FileText,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import FadeIn from "@/components/ui/FadeIn";
import { Card, CardContent } from "@/components/ui/card";
import branding from "@/config/branding.json";

export const metadata: Metadata = {
  title: "Pusat Bantuan",
  description: "Temukan jawaban dan panduan lengkap seputar layanan kami.",
};

const helpTopics = [
  {
    icon: <CalendarCheck className="w-8 h-8 text-blue-600" />,
    title: "Cara Pemesanan",
    desc: "Panduan langkah demi langkah untuk menyewa gedung atau aset.",
    href: "/help/booking",
  },
  {
    icon: <CreditCard className="w-8 h-8 text-green-600" />,
    title: "Metode Pembayaran",
    desc: "Informasi mengenai opsi pembayaran, transfer bank, dan QRIS.",
    href: "/help/payment",
  },
  {
    icon: <HelpCircle className="w-8 h-8 text-orange-600" />,
    title: "Tanya Jawab (FAQ)",
    desc: "Jawaban cepat untuk pertanyaan yang paling sering diajukan.",
    href: "/faq",
  },
  {
    icon: <FileText className="w-8 h-8 text-purple-600" />,
    title: "Syarat & Ketentuan",
    desc: "Aturan dan kebijakan penggunaan fasilitas Pusat Bisnis.",
    href: "/terms",
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-teal-600" />,
    title: "Kebijakan Privasi",
    desc: "Bagaimana kami menjaga dan melindungi data pribadi Anda.",
    href: "/privacy",
  },
  {
    icon: <MessageCircle className="w-8 h-8 text-indigo-600" />,
    title: "Hubungi Kami",
    desc: "Butuh bantuan langsung? Chat dengan tim support kami.",
    href: branding.socials.whatsapp.url, // Ganti dengan nomor WA asli
    external: true,
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white pb-20">
      <PageHeader
        title="Pusat Bantuan"
        description="Kami siap membantu Anda. Pilih topik di bawah ini untuk mendapatkan informasi lebih lanjut."
      />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {helpTopics.map((topic, idx) => (
            <FadeIn key={idx} delay={idx * 0.1} className="h-full">
              <Link
                href={topic.href}
                target={topic.external ? "_blank" : undefined}
                className="group block h-full"
              >
                <Card className="h-full border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                  <CardContent className="p-8 flex flex-col items-center text-center h-full">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-blue-50 transition-colors">
                      {topic.icon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {topic.title}
                    </h3>
                    <p className="text-slate-500 leading-relaxed text-sm">
                      {topic.desc}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </FadeIn>
          ))}
        </div>

        {/* Banner Tambahan */}
        <FadeIn delay={0.6} className="mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl relative overflow-hidden">
            {/* Dekorasi Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Masih Butuh Bantuan?
              </h2>
              <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                Tim kami siap melayani pertanyaan Anda pada jam kerja (Senin -
                Jumat, 08:00 - 16:00 WIB).
              </p>
              <a
                href={branding.socials.whatsapp.url}
                target="_blank"
                className="inline-flex items-center justify-center h-12 px-8 font-bold text-blue-700 bg-white rounded-full hover:bg-blue-50 transition shadow-lg"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Chat WhatsApp
              </a>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
