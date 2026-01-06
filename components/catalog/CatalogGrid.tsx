"use client";

import { useState } from "react";
import Image from "next/image";
import {
  BookOpen,
  Calendar,
  ArrowRight,
  X,
  Download,
  ExternalLink,
} from "lucide-react";
import { Tables } from "@/types/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Catalog = Tables<"catalogs">;

interface CatalogGridProps {
  catalogs: Catalog[];
}

export default function CatalogGrid({ catalogs }: CatalogGridProps) {
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);

  return (
    <>
      {/* --- GRID LIST (TAMPILAN DEPAN) --- */}
      {/* Bagian ini tidak berubah, tetap menampilkan cover majalah */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {catalogs.map((item) => (
          <div
            key={item.id}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col cursor-pointer"
            onClick={() => setSelectedCatalog(item)}
          >
            {/* Cover Image */}
            <div className="relative aspect-[3/4] bg-slate-200 overflow-hidden">
              {item.thumbnail_url ? (
                <Image
                  src={item.thumbnail_url}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-slate-100 text-slate-300">
                  <BookOpen className="w-16 h-16" />
                </div>
              )}

              {/* Overlay Button */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button className="bg-white text-slate-900 font-bold py-2 px-6 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Baca Sekarang
                </button>
              </div>
            </div>

            {/* Info Content */}
            <div className="p-5 flex flex-col flex-1">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <Calendar className="w-3 h-3" />
                {item.created_at
                  ? new Date(item.created_at).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                    })
                  : "-"}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-1">
                {item.description || "Tidak ada deskripsi."}
              </p>
              <div className="mt-auto block">
                <div className="text-sm font-semibold text-blue-600 flex items-center gap-1 group/link">
                  Lihat Detail{" "}
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL READER (VERSI IFRAME STABIL) --- */}
      <Dialog
        open={!!selectedCatalog}
        onOpenChange={(isOpen) => !isOpen && setSelectedCatalog(null)}
      >
        <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 bg-slate-900 border-slate-800 flex flex-col overflow-hidden">
          <DialogDescription className="sr-only">
            Membaca dokumen PDF: {selectedCatalog?.title}
          </DialogDescription>

          {selectedCatalog && (
            <>
              {/* Header Modal */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-white/10 z-50 shrink-0">
                <DialogTitle className="text-white font-medium truncate flex-1 mr-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  {selectedCatalog.title}
                </DialogTitle>

                <div className="flex items-center gap-2">
                  {/* Tombol Buka di Tab Baru (Jika Iframe bermasalah di HP tertentu) */}
                  <a
                    href={selectedCatalog.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-white hover:bg-white/10 h-8 px-2"
                      title="Buka di Tab Baru"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>

                  {/* Tombol Download */}
                  <a href={selectedCatalog.pdf_url} download>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent text-white border-white/20 hover:bg-white/10 h-8 gap-2 text-xs hidden sm:flex"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </Button>
                  </a>

                  <DialogClose asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </DialogClose>
                </div>
              </div>

              {/* PDF Container (Iframe) */}
              <div className="flex-1 w-full bg-slate-200 relative">
                {/* Tips: Menambahkan '#view=FitH' di akhir URL PDF 
                   memaksa browser untuk menyesuaikan lebar PDF dengan layar.
                   Untuk efek majalah di desktop, user bisa pakai fitur 'Two Page View' bawaan browser.
                */}
                <iframe
                  src={`${selectedCatalog.pdf_url}#view=FitH&toolbar=1&navpanes=0`}
                  className="w-full h-full border-0"
                  title="PDF Viewer"
                  allowFullScreen
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
