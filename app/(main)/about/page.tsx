import PageHeader from "@/components/ui/PageHeader";

export const metadata = {
  title: "Tentang Kami",
  description:
    "Informasi tentang Pusat Pengembangan Bisnis UIN Raden Fatah Palembang",
};

interface AboutPageProps {
  searchParams: Promise<{ q?: string; cat?: string }>;
}

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="Tentang Kami"
        description="Informasi tentang Pusat Pengembangan Bisnis UIN Raden Fatah Palembang"
      />
      <div>About Page</div>
    </>
  );
}
