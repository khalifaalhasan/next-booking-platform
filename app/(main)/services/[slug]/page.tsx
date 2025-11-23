import ServiceDetailPage from "@/components/pages/DetailService";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DetailServicePage({ params }: PageProps) {
  // 1. WAJIB: Await params dulu (Aturan Next.js 15)
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Debug di Terminal VS Code (Cek terminal hitam Anda setelah refresh)
  console.log("✅ [PAGE.TSX] Slug berhasil ditangkap:", slug);

  return (
    // 2. Kirim slug sebagai string langsung, jangan object params lagi
    <ServiceDetailPage slug={slug} />
  );
}