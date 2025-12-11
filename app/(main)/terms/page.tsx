import PageHeader from "@/components/ui/PageHeader";
import FadeIn from "@/components/ui/FadeIn";

export const metadata = {
  title: "Syarat & Ketentuan",
  description: "Aturan penggunaan layanan sewa di Pusat Bisnis.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white pb-20">
      <PageHeader
        title="Syarat & Ketentuan"
        description="Aturan penggunaan layanan sewa di Pusat Bisnis."
      />

      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <FadeIn className="prose prose-slate prose-lg max-w-none text-slate-600">
          <h3>1. Ketentuan Umum</h3>
          <p>
            Setiap penyewa wajib menjaga kebersihan, keamanan, dan keutuhan
            fasilitas yang disewa. Segala bentuk kerusakan yang diakibatkan oleh
            kelalaian penyewa akan dikenakan denda sesuai nilai kerusakan.
          </p>

          <h3>2. Prosedur Booking</h3>
          <ul>
            <li>
              Pemesanan dilakukan minimal H-1 sebelum penggunaan (kecuali aset
              tertentu).
            </li>
            <li>
              Pemesanan dianggap sah (valid) setelah pembayaran lunas atau DP
              50% diterima dan diverifikasi.
            </li>
            <li>
              Bukti booking (QR Code) wajib ditunjukkan kepada petugas saat
              check-in.
            </li>
          </ul>

          <h3>3. Larangan</h3>
          <p>Penyewa dilarang keras:</p>
          <ul>
            <li>
              Menggunakan fasilitas untuk kegiatan yang melanggar hukum atau
              norma yang berlaku di lingkungan UIN Raden Fatah.
            </li>
            <li>
              Membawa senjata tajam, minuman keras, atau obat-obatan terlarang.
            </li>
            <li>Memindahkan aset/inventaris tanpa izin petugas.</li>
          </ul>

          <h3>4. Sanksi</h3>
          <p>
            Pelanggaran terhadap syarat dan ketentuan ini dapat mengakibatkan:
          </p>
          <ul>
            <li>Penghentian paksa kegiatan/penggunaan aset.</li>
            <li>Blacklist dari layanan Pusat Bisnis di masa depan.</li>
            <li>Tuntutan ganti rugi.</li>
          </ul>
        </FadeIn>
      </div>
    </div>
  );
}
