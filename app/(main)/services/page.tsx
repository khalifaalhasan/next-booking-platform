import ServicesPage from "@/components/service/Service";
import PageHeader from "@/components/ui/PageHeader";
export const metadata = {
  title: "Layanan Kami",
  description:
    "Jelajahi berbagai layanan yang kami tawarkan untuk mendukung kebutuhan bisnis Anda.",
};
export default function Services() {
  return (
    <div>
      <PageHeader
        title="Layanan & Fasilitas Kami"
        description="Temukan gedung, ruang pertemuan, dan aset terbaik untuk kebutuhan acara bisnis maupun personal Anda."
      />
      <ServicesPage />
    </div>
  );
}
