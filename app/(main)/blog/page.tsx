import PageHeader from "@/components/ui/PageHeader";
import BlogList from "@/components/blog/Blog"; // Sesuaikan path component kamu
import { Suspense } from "react";

export const metadata = {
  title: "Blog & Berita",
  description: "Informasi terbaru, tutorial, dan update seputar layanan kami.",
};

interface PageProps {
  searchParams: Promise<{ q?: string; cat?: string }>;
}

export default async function BlogPage({ searchParams }: PageProps) {
  // Kita await searchParams di sini untuk dipassing ke component
  const resolvedParams = await searchParams;

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* 1. Header Halaman */}
      <PageHeader
        title="Blog & Berita"
        description="Temukan wawasan baru, tips teknis, dan cerita inspiratif dari tim kami."
      />

      {/* 2. List Blog (Component Logic) */}
      {/* Suspense opsional: memberi loading state saat data sedang diambil */}
      <Suspense
        fallback={<div className="py-20 text-center">Loading articles...</div>}
      >
        <BlogList searchParams={resolvedParams} />
      </Suspense>
    </main>
  );
}
