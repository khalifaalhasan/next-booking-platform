"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Load Styles
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// --- FIX FINAL WORKER ---
// 1. Kita paksa pakai HTTPS.
// 2. Kita gunakan unpkg dengan file .mjs (Module)
// 3. String literal kita kunci agar tidak ada interpolasi yang salah
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Option di luar component (Clean Code)
const PDF_OPTIONS = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
};

interface PDFViewerProps {
  url: string;
}

export default function PDFViewer({ url }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  return (
    <div
      className="flex flex-col items-center w-full"
      ref={(el) => {
        if (el) {
          setContainerWidth(el.getBoundingClientRect().width);
        }
      }}
    >
      <Document
        file={url}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        options={PDF_OPTIONS}
        loading={
          <div className="py-10 text-center">
            <p className="text-sm text-slate-500">Memuat PDF...</p>
          </div>
        }
        error={
          <div className="p-4 text-red-500 text-sm bg-red-50 rounded border border-red-200">
            Gagal memuat PDF. Cek koneksi internet atau CORS.
          </div>
        }
        className="flex flex-col gap-4"
      >
        {Array.from(new Array(numPages), (el, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            width={containerWidth ? Math.min(containerWidth - 32, 800) : 600}
            className="shadow border border-slate-200"
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        ))}
      </Document>
    </div>
  );
}