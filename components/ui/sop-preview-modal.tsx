"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// 👇 IMPORT PENTING: Gunakan 'next/dynamic'
import dynamic from "next/dynamic";

// 👇 HAPUS baris import lama: import PDFViewer from ...
// GANTI dengan ini:
const PDFViewer = dynamic(() => import("./pdf-viewer"), {
  ssr: false, // MATIKAN Server Side Rendering untuk komponen ini
  loading: () => (
    <div className="h-60 w-full flex items-center justify-center text-slate-400">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current mr-2" />
      Menyiapkan Dokumen...
    </div>
  ),
});

interface SopPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sop: { title: string; url: string } | null;
}

export default function SopPreviewModal({
  isOpen,
  onClose,
  sop,
}: SopPreviewModalProps) {
  if (!sop) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden outline-none bg-white dark:bg-slate-950">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 z-10">
          <DialogTitle className="text-lg font-semibold truncate max-w-[90%]">
            {sop.title}
          </DialogTitle>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-900/50 p-4 flex justify-center">
             {/* PDFViewer ini baru akan di-load saat di Browser, server tidak akan menyentuhnya */}
             <PDFViewer url={sop.url} />
        </div>
      </DialogContent>
    </Dialog>
  );
}