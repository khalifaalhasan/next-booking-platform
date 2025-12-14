"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  MoreHorizontal,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

import ServiceForm from "./ServiceForm";

// Import tipe dari parent page (pastikan export di page.tsx benar)
import { ServiceWithCategory } from "@/app/admin/services/page";

interface ServiceManagerProps {
  initialServices: ServiceWithCategory[];
}

export default function ServiceManager({
  initialServices,
}: ServiceManagerProps) {
  const router = useRouter();
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // State Edit sekarang menggunakan tipe ServiceWithCategory
  const [itemToEdit, setItemToEdit] = useState<ServiceWithCategory | null>(null);
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ServiceWithCategory | null>(null);

  const filteredServices = initialServices.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", itemToDelete.id);
      if (error) throw error;
      toast.success("Layanan berhasil dihapus");
      router.refresh();
      setItemToDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  return (
    <div className="space-y-6">
      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari nama layanan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah Layanan Baru
        </Button>
      </div>

      {/* TABLE DESKTOP */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Nama Layanan</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4">Harga</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredServices.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400">Tidak ada data.</td></tr>
            ) : (
              filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-medium text-slate-900">{service.name}</td>
                  <td className="px-6 py-4 text-slate-600">{service.categories?.name || "-"}</td>
                  <td className="px-6 py-4 font-mono text-slate-700">
                    {formatRupiah(service.price)}
                    <span className="text-xs text-slate-400 ml-1">/{service.unit === "per_day" ? "Hari" : "Jam"}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {service.is_active ? 
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">Aktif</Badge> : 
                      <Badge variant="secondary" className="text-slate-500">Nonaktif</Badge>
                    }
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/services/${service.slug}`} target="_blank">
                          <DropdownMenuItem className="cursor-pointer"><Eye className="mr-2 h-4 w-4" /> Preview</DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => setItemToEdit(service)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit Data
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => setItemToDelete(service)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE LIST (Disembunyikan untuk brevity, logikanya sama seperti sebelumnya) */}
      
      {/* --- MODAL CREATE --- */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Layanan Baru</DialogTitle>
          </DialogHeader>
          <ServiceForm onSuccessAction={() => setIsCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* --- MODAL EDIT --- */}
      <Dialog open={!!itemToEdit} onOpenChange={(open) => !open && setItemToEdit(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Layanan</DialogTitle>
          </DialogHeader>
          
          {/* PENJELASAN TYPE SAFE:
            ServiceForm menerima 'Tables<"services">' yg mana memiliki 'specifications: Json'.
            itemToEdit adalah 'ServiceWithCategory' yg extends 'Tables<"services">'.
            
            Oleh karena itu, 'itemToEdit' kompatibel secara struktural (Structural Typing).
            Tidak perlu 'as any' lagi!
          */}
          <ServiceForm 
            initialData={itemToEdit} 
            onSuccessAction={() => setItemToEdit(null)} 
          />
        </DialogContent>
      </Dialog>

      {/* --- MODAL HAPUS --- */}
      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Hapus Layanan?</DialogTitle>
            <DialogDescription className="text-center">
              Data <strong>{itemToDelete?.name}</strong> akan dihapus permanen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2 mt-2">
            <Button variant="outline" onClick={() => setItemToDelete(null)} disabled={isDeleting}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
               {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}