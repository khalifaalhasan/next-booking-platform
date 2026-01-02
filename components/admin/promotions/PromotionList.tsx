"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { id as indonesia } from "date-fns/locale";
import { Trash2, Edit, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deletePromotion } from "@/actions/promotion-actions";
import { toast } from "sonner";
import { Database } from "@/types/supabase";
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

type Promotion = Database["public"]["Tables"]["promotions"]["Row"];

interface PromotionsListProps {
  initialData: Promotion[];
  onEdit: (promotion: Promotion) => void;
  onRefresh?: () => void; // <--- PROPS INI WAJIB ADA
}

export default function PromotionsList({ initialData, onEdit, onRefresh }: PromotionsListProps) {
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteImage, setDeleteImage] = useState<string | null>(null);

  // --- FUNGSI EKSEKUTOR HAPUS ---
  const confirmDelete = async () => {
    if (!deleteId) return;

    // Pastikan gambar string kosong jika null, biar server action gak error
    const imgUrl = deleteImage || ""; 

    startTransition(async () => {
      // 1. Panggil Server Action
      const result = await deletePromotion(deleteId, imgUrl);
      
      if (result?.error) {
        toast.error("Gagal: " + result.error);
      } else {
        toast.success("Promo berhasil dihapus");
        
        // 2. TRIGGER REFRESH DISINI (PENTING!)
        if (onRefresh) {
            console.log("Memicu refresh data..."); // Cek console browser kalo masih error
            onRefresh(); 
        } else {
            console.error("Fungsi onRefresh tidak ditemukan/tidak dipass!");
        }
      }
      setDeleteId(null);
    });
  };

  return (
    <>
      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-medium">
              <tr>
                <th className="px-4 py-3">Banner</th>
                <th className="px-4 py-3">Info Promo</th>
                <th className="px-4 py-3">Periode</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialData.length === 0 ? (
                <tr>
                   <td colSpan={5} className="p-8 text-center text-slate-400">Belum ada data promosi.</td>
                </tr>
              ) : (
                initialData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    {/* Image */}
                    <td className="px-4 py-3">
                      <div className="relative w-24 h-12 bg-slate-100 rounded overflow-hidden border">
                        <Image src={item.image_url} alt="img" fill className="object-cover" />
                      </div>
                    </td>

                    {/* Info */}
                    <td className="px-4 py-3 max-w-[200px]">
                      <div className="font-semibold truncate text-slate-900">{item.title}</div>
                      <div className="text-xs text-slate-500 truncate">{item.description}</div>
                      {item.link_url && (
                        <a href={item.link_url} target="_blank" className="text-[10px] text-blue-600 flex items-center gap-1 mt-1 hover:underline">
                          Link <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </td>

                    {/* Periode */}
                    <td className="px-4 py-3 whitespace-nowrap text-xs">
                       <div className="flex flex-col gap-0.5">
                          <span className="text-green-600 font-medium">Mulai: {format(new Date(item.start_date), "dd MMM yyyy", { locale: indonesia })}</span>
                          <span className="text-red-500 font-medium">Selesai: {format(new Date(item.end_date), "dd MMM yyyy", { locale: indonesia })}</span>
                       </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      {item.is_active ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 shadow-none">Aktif</Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-500 bg-slate-50 shadow-none">Nonaktif</Badge>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => onEdit(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50" onClick={() => { setDeleteId(item.id); setDeleteImage(item.image_url); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Promo?</AlertDialogTitle>
            <AlertDialogDescription>Data dan gambar akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); confirmDelete(); }} className="bg-red-600 hover:bg-red-700" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}