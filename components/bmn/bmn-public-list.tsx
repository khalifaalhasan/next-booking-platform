"use client";

import { useState } from "react";
import { Tables } from "@/types/supabase";
import { Search, Package, MapPin, Calendar, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface BmnPublicListProps {
  initialData: Tables<"bmn_records">[];
}

export default function BmnPublicList({ initialData }: BmnPublicListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter Logic
  const filteredData = initialData.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.uraian_barang.toLowerCase().includes(term) ||
      item.kode_barang.toLowerCase().includes(term) ||
      (item.lokasi && item.lokasi.toLowerCase().includes(term)) ||
      (item.merek_tipe && item.merek_tipe.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      
      {/* --- SEARCH BAR SECTION --- */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari aset (nama, kode, lokasi, atau merek)..."
            className="pl-10 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-slate-500 font-medium">
          Menampilkan {filteredData.length} dari {initialData.length} Data
        </div>
      </div>

      {/* --- TABLE CARD --- */}
      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-slate-50 border-b pb-4">
            <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-lg">Daftar Inventaris BMN</CardTitle>
            </div>
            <CardDescription>
                Data Barang Milik Negara yang tercatat di Pusat Pengembangan Bisnis.
            </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white">
                <TableRow>
                  <TableHead className="w-[50px] text-center">No</TableHead>
                  <TableHead className="min-w-[150px]">Identitas Barang</TableHead>
                  <TableHead className="hidden md:table-cell">Merek / Tipe</TableHead>
                  <TableHead className="hidden md:table-cell">Tahun</TableHead>
                  <TableHead>Kondisi</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead className="text-center">Jml</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Info className="w-8 h-8 mb-2 opacity-50" />
                        <p>Data tidak ditemukan.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="text-center font-medium text-slate-500">
                        {index + 1}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 text-sm">
                            {item.uraian_barang}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono mt-0.5">
                            {item.kode_barang}
                            {item.nup && <span className="ml-1 text-slate-400">| NUP: {item.nup}</span>}
                          </span>
                          {/* Tampilan Mobile Only: Merek muncul disini */}
                          <span className="md:hidden text-xs text-slate-500 mt-1">
                             {item.merek_tipe} ({item.tahun_perolehan})
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="hidden md:table-cell text-sm text-slate-600">
                        {item.merek_tipe || "-"}
                      </TableCell>

                      <TableCell className="hidden md:table-cell text-sm text-slate-600">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {item.tahun_perolehan}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2 py-0.5 font-normal border ${
                            item.kondisi === "Baik"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : item.kondisi === "Rusak Ringan"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {item.kondisi}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {item.lokasi ? (
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 w-fit px-2 py-1 rounded-full">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {item.lokasi}
                            </div>
                        ) : (
                            <span className="text-slate-300">-</span>
                        )}
                      </TableCell>

                      <TableCell className="text-center font-medium text-sm">
                        {item.kuantitas} <span className="text-[10px] text-slate-400 font-normal">{item.satuan}</span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center text-xs text-slate-400 mt-8">
        &copy; {new Date().getFullYear()} Unit Penatausahaan BMN - Pusat Pengembangan Bisnis
      </div>
    </div>
  );
}