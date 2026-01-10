"use client";

import { useState } from "react";
import { Database } from "@/types/supabase";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Eye, Calendar, HardDrive } from "lucide-react";

import SopPreviewModal from "@/components/ui/sop-preview-modal"; // Pastikan path import benar
import { formatBytes, formatDate } from "@/lib/formatters";

type Sop = Database["public"]["Tables"]["sops"]["Row"];

interface SopListProps {
  initialData: Sop[];
  storageBaseUrl: string;
}

export default function SopList({ initialData, storageBaseUrl }: SopListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSop, setSelectedSop] = useState<Sop | null>(null);

  const filteredSops = initialData.filter((sop) =>
    sop.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Di dalam SopList.tsx
  const getFullUrl = (path: string) => {
    const originalUrl = `${storageBaseUrl}/${path}`;
    // Encode URL agar aman dikirim sebagai parameter
    return `/api/pdf?url=${encodeURIComponent(originalUrl)}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Search Bar Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Cari judul SOP atau dokumen..."
            className="pl-10 h-12 text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="hidden sm:block text-sm text-muted-foreground whitespace-nowrap px-4 border-l">
          Total: <strong>{filteredSops.length}</strong> Dokumen
        </div>
      </div>

      {/* 2. Grid List */}
      {filteredSops.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl bg-slate-50 dark:bg-slate-900/50">
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
            Tidak ada SOP ditemukan
          </h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            Coba gunakan kata kunci lain atau pastikan ejaan judul benar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSops.map((sop) => (
            <Card
              key={sop.id}
              className="group relative flex flex-col justify-between overflow-hidden border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Decorative Accent on Hover */}
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />

              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  {/* Icon Box */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <FileText className="h-6 w-6" />
                  </div>

                  {/* Badge Label (Opsional: Bisa diganti kategori jika ada) */}
                  <Badge
                    variant="outline"
                    className="text-xs font-normal text-slate-500"
                  >
                    PDF
                  </Badge>
                </div>

                <h3 className="text-lg font-semibold leading-snug text-slate-900 dark:text-slate-50 line-clamp-2 min-h-[3.5rem] mb-2 group-hover:text-blue-600 transition-colors">
                  {sop.title}
                </h3>

                {/* Metadata Row */}
                <div className="flex flex-col gap-2 mt-4 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {sop.created_at ? formatDate(sop.created_at) : "-"}
                    </span>
                  </div>
                  {sop.file_size && (
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-3.5 w-3.5" />
                      <span>{formatBytes(sop.file_size)}</span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="pt-2 pb-6">
                <Button
                  className="w-full bg-slate-100 text-slate-900 hover:bg-blue-600 hover:text-white border border-slate-200 hover:border-blue-600 transition-all duration-300"
                  variant="ghost"
                  onClick={() => setSelectedSop(sop)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Baca Dokumen
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* 3. The "Float" / Modal */}
      <SopPreviewModal
        isOpen={!!selectedSop}
        onClose={() => setSelectedSop(null)}
        sop={
          selectedSop
            ? {
                title: selectedSop.title,
                url: getFullUrl(selectedSop.file_path ?? ""),
              }
            : null
        }
      />
    </div>
  );
}
