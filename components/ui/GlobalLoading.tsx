import { Skeleton } from "@/components/ui/Skeleton"; // Pastikan path import lowercase 'skeleton' jika file-nya skeleton.tsx

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-white pb-20 pt-6">
      {/* CONTAINER UTAMA: max-w-7xl & Padding Responsif */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. Header Skeleton */}
        <div className="mb-8 pb-6 border-b border-gray-100">
          <Skeleton className="h-8 w-64 mb-2 rounded-lg" /> {/* Judul Page */}
          <Skeleton className="h-4 w-96 rounded-md" /> {/* Deskripsi */}
        </div>

        {/* 2. Grid Layout (Form di Kiri, Summary di Kanan) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* KOLOM KIRI (Konten Utama/Form) - Span 8 */}
          <div className="lg:col-span-8 space-y-6">
            {/* Simulasi Card Form 1 (Data Diri) */}
            <div className="p-6 border border-gray-100 rounded-2xl space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-6 w-40 rounded-md" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-12 w-full rounded-xl" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              </div>
            </div>

            {/* Simulasi Card Form 2 (Detail Lain) */}
            <div className="p-6 border border-gray-100 rounded-2xl space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-6 w-32 rounded-md" />
              </div>
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </div>

          {/* KOLOM KANAN (Sticky Summary) - Span 4 */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <div className="p-6 border border-gray-100 rounded-2xl space-y-6">
                <Skeleton className="h-6 w-48 rounded-md" />

                {/* Image Thumbnail */}
                <div className="flex gap-4">
                  <Skeleton className="h-20 w-20 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-3 w-2/3 rounded-md" />
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-50">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>

                {/* Tombol Besar */}
                <Skeleton className="h-14 w-full rounded-xl mt-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
