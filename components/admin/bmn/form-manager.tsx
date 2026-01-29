"use client";

import { useState } from "react";
import { Tables } from "@/types/supabase";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { deleteBmn } from "@/actions/bmn-action";
import { toast } from "sonner";

// Import Komponen Kita
import BmnFormDialog from "./form-dialog";
import ExportBmnButton from "@/components/bmn/export-button"; // Asumsi file export tadi

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

interface BmnManagerProps {
  initialData: Tables<"bmn_records">[];
}

export default function BmnManager({ initialData }: BmnManagerProps) {
  // State Dialog Form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<Tables<"bmn_records"> | null>(null);

  // State Delete Confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // State Search (Client Side Filtering Simple)
  const [searchTerm, setSearchTerm] = useState("");

  // --- HANDLERS ---

  const handleCreate = () => {
    setSelectedData(null); // Mode Create
    setIsFormOpen(true);
  };

  const handleEdit = (item: Tables<"bmn_records">) => {
    setSelectedData(item); // Mode Edit
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id); // Buka dialog konfirmasi
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const res = await deleteBmn(deleteId);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
    setDeleteId(null);
  };

  // Filter Data di Client (Biar cepet gak bolak balik server untuk search sederhana)
  const filteredData = initialData.filter((item) =>
    item.uraian_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kode_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.lokasi && item.lokasi.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      
      {/* --- TOOLBAR: SEARCH, ADD, EXPORT --- */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Cari nama aset, kode, atau lokasi..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          {/* Component Export yang tadi dibuat */}
          <ExportBmnButton data={filteredData} />
          
          <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" /> Catat BMN
          </Button>
        </div>
      </div>

      {/* --- TABLE VIEW --- */}
      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[50px]">No</TableHead>
              <TableHead>Kode / NUP</TableHead>
              <TableHead>Uraian Barang</TableHead>
              <TableHead>Tahun</TableHead>
              <TableHead>Kondisi</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead className="text-right">Nilai (Rp)</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                        Tidak ada data ditemukan.
                    </TableCell>
                </TableRow>
            ) : (
                filteredData.map((item, index) => (
                <TableRow key={item.id} className="hover:bg-slate-50/50">
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                    <div className="font-medium text-xs">{item.kode_barang}</div>
                    <div className="text-[10px] text-muted-foreground">{item.nup || "-"}</div>
                    </TableCell>
                    <TableCell>
                    <div className="font-medium">{item.uraian_barang}</div>
                    <div className="text-xs text-muted-foreground">{item.merek_tipe}</div>
                    </TableCell>
                    <TableCell>{item.tahun_perolehan}</TableCell>
                    <TableCell>
                        <Badge variant={
                            item.kondisi === "Baik" ? "default" : 
                            item.kondisi === "Rusak Ringan" ? "secondary" : "destructive"
                        } className="text-[10px]">
                            {item.kondisi}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{item.lokasi || "-"}</TableCell>
                    <TableCell className="text-right font-mono text-xs">
                        {new Intl.NumberFormat("id-ID").format(Number(item.nilai_perolehan))}
                    </TableCell>
                    <TableCell>
                    <div className="flex justify-center gap-2">
                        <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleEdit(item)}
                        >
                        <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteClick(item.id)}
                        >
                        <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="text-xs text-muted-foreground px-2">
         Total Aset: <strong>{filteredData.length}</strong> item
      </div>

      {/* --- DIALOGS (Hidden until triggered) --- */}
      
      {/* 1. Form Dialog (Create/Update) */}
      <BmnFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        initialData={selectedData} 
      />

      {/* 2. Alert Dialog (Delete Confirmation) */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Data BMN ini akan dihapus permanen dari database. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Hapus Permanen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}