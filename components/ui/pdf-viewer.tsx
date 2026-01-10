'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Penting: Load CSS bawaan react-pdf agar text layer rapi
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// --- SETUP WORKER (WAJIB UNTUK NEXT.JS) ---
// Menggunakan CDN agar tidak memberatkan bundle utama
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
}

export default function PDFViewer({ url }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div 
      className="flex flex-col items-center w-full min-h-[300px] bg-slate-100/50 dark:bg-slate-900/50 p-4"
      // Ref untuk mendeteksi lebar container agar PDF responsif
      ref={(el) => {
        if (el) {
          setContainerWidth(el.getBoundingClientRect().width);
        }
      }}
    >
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="flex flex-col items-center justify-center py-10 space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm text-slate-500">Memuat Dokumen...</p>
          </div>
        }
        error={
          <div className="flex flex-col items-center justify-center py-10 text-red-500">
            <p className="font-semibold">Gagal memuat PDF</p>
            <p className="text-xs">Pastikan URL file benar dan dapat diakses publik.</p>
          </div>
        }
        className="flex flex-col gap-4"
      >
        {/* Render halaman PDF */}
        {Array.from(new Array(numPages), (el, index) => (
          <Page 
            key={`page_${index + 1}`} 
            pageNumber={index + 1} 
            // Responsif: Lebar mengikuti container, max 800px biar ga pecah
            width={containerWidth ? Math.min(containerWidth - 32, 800) : 600} 
            className="shadow-md"
            renderTextLayer={false} // Matikan text select kalau mau lebih ringan
            renderAnnotationLayer={false} // Matikan link kalau tidak butuh
          />
        ))}
      </Document>
    </div>
  );
}