"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import FadeIn from "@/components/ui/FadeIn";

const faqs = [
  {
    question: "Bagaimana cara melakukan pemesanan gedung/aset?",
    answer: "Anda harus mendaftar akun terlebih dahulu. Setelah login, pilih layanan yang diinginkan, tentukan tanggal/jam, dan lakukan checkout. Verifikasi email diperlukan sebelum melakukan pembayaran."
  },
  {
    question: "Apakah mahasiswa UIN Raden Fatah mendapat harga khusus?",
    answer: "Ya, kami memiliki tarif khusus untuk Civitas Akademika (Mahasiswa/Dosen/Staf). Pastikan mendaftar menggunakan email institusi atau verifikasi KTM saat pengambilan aset."
  },
  {
    question: "Metode pembayaran apa saja yang tersedia?",
    answer: "Saat ini kami mendukung pembayaran via Transfer Bank (Virtual Account) dan QRIS. Pembayaran tunai hanya dapat dilakukan langsung di kantor UPT Pusat Pengembangan Bisnis."
  },
  {
    question: "Apakah booking bisa dibatalkan?",
    answer: "Pembatalan bisa dilakukan maksimal H-3 sebelum tanggal penggunaan. Pengembalian dana (refund) akan dipotong biaya administrasi sebesar 10%."
  },
  {
    question: "Bagaimana jika saya telat mengembalikan alat?",
    answer: "Keterlambatan pengembalian akan dikenakan denda sesuai dengan tarif per jam yang berlaku pada aset tersebut."
  },
];

export default function FAQSection({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <section className="py-16 bg-white">
      <div className="container max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {showHeader && (
            <FadeIn className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Pertanyaan Umum</h2>
            <p className="text-slate-500">
                Jawaban untuk pertanyaan yang sering diajukan pengguna.
            </p>
            </FadeIn>
        )}

        <FadeIn delay={0.2}>
            <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="border-b border-slate-100">
                <AccordionTrigger className="text-left text-slate-900 font-semibold hover:text-blue-600 transition-colors py-4">
                    {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed pb-4">
                    {faq.answer}
                </AccordionContent>
                </AccordionItem>
            ))}
            </Accordion>
        </FadeIn>
      </div>
    </section>
  );
}