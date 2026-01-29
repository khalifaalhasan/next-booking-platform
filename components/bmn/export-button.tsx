"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Tables } from "@/types/supabase";

export default function ExportBmnButton({ data }: { data: Tables<"bmn_records">[] }) {
  
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert("Tidak ada data untuk diexport");
      return;
    }

    // 1. Definisikan Header CSV
    const headers = [
      "No", "Kode Barang", "Uraian Barang", "NUP", "Tahun", "Merek/Tipe", 
      "Kuantitas", "Satuan", "Nilai (Rp)", "Kondisi", "Lokasi", "Ket"
    ];

    // 2. Map Data ke Format CSV Row
    const rows = data.map((item, idx) => [
      idx + 1,
      `"${item.kode_barang}"`, // Pakai kutip biar aman jika ada koma
      `"${item.uraian_barang}"`,
      `'${item.nup || ""}`, // Kasih petik satu biar excel baca sebagai text (bukan angka/rumus)
      item.tahun_perolehan,
      `"${item.merek_tipe || ""}"`,
      item.kuantitas,
      item.satuan,
      item.nilai_perolehan,
      item.kondisi,
      `"${item.lokasi || ""}"`,
      `"${item.keterangan || ""}"`
    ]);

    // 3. Gabungkan Header + Rows
    const csvContent = [
      headers.join(","), 
      ...rows.map(e => e.join(","))
    ].join("\n");

    // 4. Trigger Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Laporan_BMN_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button variant="outline" onClick={handleExport} className="gap-2">
      <Download className="w-4 h-4" /> Export Spreadsheet
    </Button>
  );
}