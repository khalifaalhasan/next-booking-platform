"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { TicketDocument } from "@/components/pdf/E-Ticket";
import { Tables } from "@/types/supabase";

// 1. Definisikan Tipe Data Booking yang dibutuhkan Tiket
// Booking wajib punya data Service (untuk nama gedung/alat)
export type TicketBookingData = Tables<"bookings"> & {
  service: Tables<"services"> | null;
};

interface DownloadTicketButtonProps {
  booking: TicketBookingData;
}

// Lazy load PDFDownloadLink agar tidak error di server (Next.js SSR)
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => (
      <Button
        disabled
        className="w-full bg-green-600 opacity-50 cursor-not-allowed py-6"
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat Tiket...
      </Button>
    ),
  }
);

export default function DownloadTicketButton({ booking }: DownloadTicketButtonProps) {
  return (
    <PDFDownloadLink
      document={<TicketDocument booking={booking} />}
      fileName={`Tiket-${booking.id.slice(0, 8)}.pdf`}
    >
    
     
      {({ loading }) => (
        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 shadow-lg shadow-green-100 active:scale-[0.98] transition-transform"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Download className="mr-2 h-5 w-5" /> Download E-Tiket (PDF)
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
}