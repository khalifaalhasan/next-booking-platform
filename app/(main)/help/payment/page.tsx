import PageHeader from "@/components/ui/PageHeader";
import FadeIn from "@/components/ui/FadeIn";

export const metadata = {
  title: "Metode Pembayaran",
  description: "Informasi mengenai pembayaran sewa layanan.",
};

export default function PaymentHelpPage() {
  return (
    <div className="min-h-screen bg-white pb-20">
      <PageHeader
        title="Metode Pembayaran"
        description="Informasi mengenai pembayaran sewa layanan."
      />

      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <FadeIn className="prose prose-slate prose-lg max-w-none text-slate-600">
          <p>
            Kami menyediakan berbagai metode pembayaran yang aman dan
            terverifikasi. Pastikan Anda melakukan pembayaran sebelum batas
            waktu yang ditentukan agar pesanan tidak hangus otomatis.
          </p>

          <h3>1. Transfer Bank (Virtual Account)</h3>
          <p>
            Pembayaran akan diverifikasi otomatis oleh sistem. Bank yang
            didukung:
          </p>
          <ul className="grid grid-cols-2 gap-4 list-none pl-0">
            <li className="bg-slate-50 p-3 rounded-lg border text-center font-bold text-slate-700">
              Bank Sumsel Babel
            </li>
            <li className="bg-slate-50 p-3 rounded-lg border text-center font-bold text-slate-700">
              Bank Syariah Indonesia (BSI)
            </li>
            <li className="bg-slate-50 p-3 rounded-lg border text-center font-bold text-slate-700">
              Bank Mandiri
            </li>
            <li className="bg-slate-50 p-3 rounded-lg border text-center font-bold text-slate-700">
              Bank BRI
            </li>
          </ul>

          <h3>2. QRIS</h3>
          <p>
            Dapat dibayar menggunakan GoPay, OVO, Dana, ShopeePay, dan Mobile
            Banking apa saja yang mendukung scan QRIS.
          </p>

          <h3>3. Konfirmasi Manual</h3>
          <p>
            Jika mengalami kendala pembayaran otomatis, Anda dapat melakukan
            transfer manual ke rekening bendahara UPT dan melakukan konfirmasi
            bukti transfer melalui WhatsApp Admin.
          </p>

          <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl text-sm text-yellow-800">
            <strong>Penting:</strong> Pembayaran DP (Down Payment) minimal 50%
            wajib dilakukan untuk mengamankan slot tanggal. Pelunasan wajib
            dilakukan H-1 sebelum penggunaan.
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
