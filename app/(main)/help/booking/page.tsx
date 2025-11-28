import PageHeader from "@/components/ui/PageHeader";
import FadeIn from "@/components/ui/FadeIn";
import { Search, UserPlus, CalendarCheck, CreditCard, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: <UserPlus className="w-6 h-6" />,
    title: "1. Daftar Akun",
    desc: "Buat akun menggunakan email aktif. Untuk mahasiswa/dosen, gunakan data yang sesuai identitas kampus."
  },
  {
    icon: <Search className="w-6 h-6" />,
    title: "2. Cari Layanan",
    desc: "Telusuri daftar gedung, kendaraan, atau peralatan. Baca spesifikasi dan lihat ketersediaan tanggal."
  },
  {
    icon: <CalendarCheck className="w-6 h-6" />,
    title: "3. Tentukan Jadwal",
    desc: "Pilih tanggal check-in/check-out atau jam pemakaian. Sistem akan otomatis menghitung biaya sewa."
  },
  {
    icon: <CreditCard className="w-6 h-6" />,
    title: "4. Lakukan Pembayaran",
    desc: "Pilih metode pembayaran (Full/DP). Lakukan transfer sesuai nominal yang tertera di invoice."
  },
  {
    icon: <CheckCircle className="w-6 h-6" />,
    title: "5. Verifikasi & Tiket",
    desc: "Setelah pembayaran dikonfirmasi admin, E-Tiket (QR Code) akan muncul di menu 'Pesanan Saya'."
  }
];

export default function BookingHelpPage() {
  return (
    <div className="min-h-screen bg-white pb-20">
      <PageHeader 
        title="Panduan Pemesanan" 
        description="Langkah mudah menyewa fasilitas di Pusat Bisnis."
      />
      
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="space-y-8">
          {steps.map((step, idx) => (
             <FadeIn key={idx} delay={idx * 0.1}>
                <div className="flex gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                    <div className="shrink-0 w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-600 border border-blue-50">
                        {step.icon}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                        <p className="text-slate-600 leading-relaxed">{step.desc}</p>
                    </div>
                </div>
             </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}