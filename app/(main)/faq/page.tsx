import PageHeader from "@/components/ui/PageHeader";
import FAQSection from "@/components/home/FAQSection";

export const metadata = {
  title: "Frequently Asked Questions",
  description:
    "Temukan jawaban cepat seputar layanan, pembayaran, dan prosedur peminjaman di Pusat Bisnis UIN Raden Fatah.",
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title="Frequently Asked Questions"
        description="Temukan jawaban cepat seputar layanan, pembayaran, dan prosedur peminjaman di Pusat Bisnis UIN Raden Fatah."
      />
      <FAQSection showHeader={false} />
    </div>
  );
}
