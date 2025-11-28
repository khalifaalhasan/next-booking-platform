import PageHeader from "@/components/ui/PageHeader";
import FadeIn from "@/components/ui/FadeIn";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white pb-20">
      <PageHeader 
        title="Kebijakan Privasi" 
        description="Komitmen kami untuk melindungi data pribadi Anda."
      />
      
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <FadeIn className="prose prose-slate prose-lg max-w-none text-slate-600">
          <h3>1. Pendahuluan</h3>
          <p>
            UPT Pusat Pengembangan Bisnis UIN Raden Fatah menghormati privasi Anda. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda saat menggunakan platform pemesanan online ini.
          </p>

          <h3>2. Data yang Kami Kumpulkan</h3>
          <p>Kami mengumpulkan data berikut untuk keperluan administrasi dan keamanan:</p>
          <ul>
            <li>Identitas diri (Nama lengkap sesuai KTP/KTM).</li>
            <li>Informasi kontak (Email, Nomor Telepon/WhatsApp).</li>
            <li>Data transaksi pemesanan dan pembayaran.</li>
          </ul>

          <h3>3. Penggunaan Data</h3>
          <p>Data Anda digunakan semata-mata untuk:</p>
          <ul>
            <li>Memproses pesanan sewa gedung atau aset.</li>
            <li>Mengirimkan tiket booking dan invoice.</li>
            <li>Menghubungi Anda dalam keadaan darurat terkait pemesanan.</li>
            <li>Verifikasi status civitas akademika (jika berlaku).</li>
          </ul>

          <h3>4. Keamanan Data</h3>
          <p>
            Kami menggunakan standar keamanan enkripsi data untuk melindungi informasi Anda. Kami tidak akan menjual atau membagikan data Anda kepada pihak ketiga tanpa persetujuan Anda, kecuali diwajibkan oleh hukum.
          </p>

          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mt-8 not-prose">
            <p className="text-sm text-blue-800 font-medium">
              <strong>Catatan:</strong> Dengan mendaftar di aplikasi ini, Anda menyetujui pengumpulan dan penggunaan informasi sesuai kebijakan ini.
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}