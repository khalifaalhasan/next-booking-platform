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

// Import Tipe Data dari Page Parent (agar sinkron)
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ServiceWithCategory | null>(
    null
  );

  // Filter Pencarian (Case Insensitive)
  const filteredServices = initialServices.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  // Handle Hapus
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
      setItemToDelete(null); // Tutup dialog
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper Format Rupiah
  const formatRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  return (
    <div className="space-y-6">
      {/* --- TOOLBAR (SEARCH & ADD) --- */}
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
        <Link href="/admin/services/create" className="w-full sm:w-auto">
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Tambah Layanan Baru
          </Button>
        </Link>
      </div>

      {/* --- TAMPILAN DESKTOP (TABLE) --- */}
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
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  Tidak ada data layanan yang cocok.
                </td>
              </tr>
            ) : (
              filteredServices.map((service) => (
                <tr
                  key={service.id}
                  className="hover:bg-slate-50/50 transition"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {service.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {service.categories?.name || "-"}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-700">
                    {formatRupiah(service.price)}
                    <span className="text-xs text-slate-400 ml-1">
                      /{service.unit === "per_day" ? "Hari" : "Jam"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {service.is_active ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                        Aktif
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-slate-500">
                        Nonaktif
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Pilihan</DropdownMenuLabel>
                        <Link
                          href={`/services/${service.slug}`}
                          target="_blank"
                        >
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" /> Lihat Preview
                          </DropdownMenuItem>
                        </Link>
                        <Link href={`/admin/services/${service.id}/edit`}>
                          <DropdownMenuItem className="cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" /> Edit Data
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                          onClick={() => setItemToDelete(service)}
                        >
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

      {/* --- TAMPILAN MOBILE (CARD LIST) --- */}
      <div className="md:hidden space-y-4">
        {filteredServices.map((service) => (
          <Card
            key={service.id}
            className="overflow-hidden border-slate-200 shadow-sm"
          >
            <CardHeader className="pb-2 bg-slate-50/50 border-b border-slate-100 p-4">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <CardTitle className="text-base font-bold text-slate-900 truncate">
                    {service.name}
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-1 truncate">
                    {service.categories?.name}
                  </p>
                </div>
                {service.is_active ? (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-200 shrink-0 text-[10px]">
                    Aktif
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    Nonaktif
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-sm items-center">
                <span className="text-slate-500">Harga Sewa</span>
                <span className="font-semibold text-slate-900">
                  {formatRupiah(service.price)}
                  <span className="text-xs font-normal text-slate-400">
                    {" "}
                    / {service.unit === "per_day" ? "Hari" : "Jam"}
                  </span>
                </span>
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-100 p-3 grid grid-cols-3 gap-2 bg-slate-50/30">
              <Link
                href={`/services/${service.slug}`}
                className="w-full"
                target="_blank"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs h-9 bg-white border border-slate-200 hover:bg-slate-50"
                >
                  <Eye className="w-3 h-3 mr-1.5" /> Lihat
                </Button>
              </Link>
              <Link
                href={`/admin/services/${service.id}/edit`}
                className="w-full"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-9 border-slate-200 bg-white hover:bg-slate-50"
                >
                  <Pencil className="w-3 h-3 mr-1.5" /> Edit
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="sm"
                className="w-full text-xs h-9 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 hover:text-red-700 shadow-none"
                onClick={() => setItemToDelete(service)}
              >
                <Trash2 className="w-3 h-3 mr-1.5" /> Hapus
              </Button>
            </CardFooter>
          </Card>
        ))}
        {filteredServices.length === 0 && (
          <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed flex flex-col items-center justify-center gap-2">
            <Search className="w-8 h-8 opacity-20" />
            <p className="text-sm">Tidak ada layanan ditemukan.</p>
          </div>
        )}
      </div>

      {/* --- DIALOG KONFIRMASI HAPUS --- */}
      <Dialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto bg-red-100 p-3 rounded-full mb-2 w-fit animate-in zoom-in duration-300">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="text-center">
              Hapus Layanan Ini?
            </DialogTitle>
            <DialogDescription className="text-center">
              Anda akan menghapus <strong>{itemToDelete?.name}</strong>. <br />
              Data yang dihapus tidak dapat dikembalikan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setItemToDelete(null)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus Permanen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
