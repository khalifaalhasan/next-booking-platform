"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { TicketDocument } from "@/components/pdf/E-Ticket";

// Lazy load PDFDownloadLink agar tidak error di server (Next.js SSR)
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => (
      <Button
        disabled
        variant="outline"
        className="w-full border-blue-200 text-blue-600"
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat PDF...
      </Button>
    ),
  }
);

export default function DownloadTicketButton({ booking }: { booking: any }) {
  return (
    <PDFDownloadLink
      document={<TicketDocument booking={booking} />}
      fileName={`Ticket-${booking.id.slice(0, 8)}.pdf`}
    >
      {({ blob, url, loading, error }) => (
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 shadow-lg shadow-blue-100"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Download className="mr-2 h-5 w-5" /> Download E-Tiket
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
