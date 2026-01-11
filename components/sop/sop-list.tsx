"use client";

import { useState } from "react";
import { Database } from "@/types/supabase";
import {
  FileText,
  Search,
  Calendar,
  HardDrive,
  X,
  ExternalLink,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatBytes, formatDate } from "@/lib/formatters";

type Sop = Database["public"]["Tables"]["sops"]["Row"];

interface SopListProps {
  initialData: Sop[];
  storageBaseUrl?: string; 
}

export default function SopList({ initialData }: SopListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSop, setSelectedSop] = useState<Sop | null>(null);

  const filteredSops = initialData.filter((sop) =>
    sop.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper URL
  const getPublicUrl = (filePath: string) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const bucketName = "sops-files"; 
    const encodedPath = filePath.split('/').map(p => encodeURIComponent(p)).join('/');
    return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${encodedPath}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* --- SEARCH BAR (Modern) --- */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Cari SOP atau dokumen..."
            className="pl-10 h-12 text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="hidden sm:block text-sm text-muted-foreground whitespace-nowrap px-4 border-l font-medium">
          {filteredSops.length} Dokumen
        </div>
      </div>

      {/* --- GRID LIST (Compact & Modern) --- */}
      {filteredSops.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl bg-slate-50 dark:bg-slate-900/50">
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
            Tidak ada dokumen ditemukan
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSops.map((sop) => (
            <div
              key={sop.id}
              onClick={() => setSelectedSop(sop)}
              className="
                group relative flex flex-col gap-4 p-5 
                bg-white dark:bg-slate-950 
                border border-slate-200 dark:border-slate-800 rounded-xl
                hover:border-blue-500 hover:shadow-md 
                transition-all duration-200 cursor-pointer
              "
            >
              {/* Header Card: Icon & Badge */}
              <div className="flex items-start justify-between">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <FileText className="w-5 h-5" />
                </div>
                {/* Visual Indicator (Arrow) */}
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>

              {/* Content Info */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                  {sop.title}
                </h3>
                
                <div className="flex items-center gap-3 text-xs text-slate-500">
                   <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-md">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{sop.created_at ? formatDate(sop.created_at) : "-"}</span>
                   </div>
                   {sop.file_size && (
                     <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-md">
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>{formatBytes(sop.file_size)}</span>
                     </div>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL READER --- */}
      <Dialog
        open={!!selectedSop}
        onOpenChange={(isOpen) => !isOpen && setSelectedSop(null)}
      >
        <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 bg-slate-900 border-slate-800 flex flex-col overflow-hidden outline-none">
          <DialogDescription className="sr-only">
            Membaca SOP: {selectedSop?.title}
          </DialogDescription>

          {selectedSop && (
            <>
              {/* Header Modal */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-white/10 z-50 shrink-0">
                <DialogTitle className="text-white font-medium truncate flex-1 mr-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  {selectedSop.title}
                </DialogTitle>

                <div className="flex items-center gap-2">
                  {/* Tombol Buka di Tab Baru */}
                  <a
                    href={getPublicUrl(selectedSop.file_path ?? "")}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-white hover:bg-white/10 h-8 px-2 gap-2"
                      title="Buka Layar Penuh"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="hidden sm:inline text-xs">Buka Tab Baru</span>
                    </Button>
                  </a>

                  {/* Tombol Download SUDAH DIHAPUS DISINI */}

                  {/* Tombol Close */}
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
                <iframe
                  // navpanes=0: Tutup sidebar sidebar
                  // toolbar=1: Tampilkan toolbar atas (zoom, page number)
                  src={`${getPublicUrl(selectedSop.file_path ?? "")}#view=FitH&navpanes=0&toolbar=1`}
                  className="w-full h-full border-0"
                  title="PDF Viewer"
                  allowFullScreen
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}