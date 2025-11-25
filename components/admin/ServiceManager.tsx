"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import ServiceForm from "@/components/admin/ServiceForm";
import Image from "next/image"; // Pakai Image Next.js
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { Tables } from "@/types/supabase";

// Define Tipe Data dengan Relasi
type ServiceWithCategory = Tables<"services"> & {
  categories: { name: string } | null; // Relasi ke tabel categories
};

export default function ServiceManager({
  initialServices,
}: {
  initialServices: ServiceWithCategory[];
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedService, setSelectedService] =
    useState<ServiceWithCategory | null>(null);

  const supabase = createClient();
  const router = useRouter();

  // Create
  const handleCreate = () => {
    setSelectedService(null);
    setIsDialogOpen(true);
  };

  // Edit
  const handleEdit = (service: ServiceWithCategory) => {
    setSelectedService(service);
    setIsDialogOpen(true);
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Yakin ingin menghapus service ini? Data yang dihapus tidak bisa dikembalikan."
      )
    )
      return;

    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) alert("Gagal hapus: " + error.message);
    else router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Kelola Service</h1>
        <Button onClick={handleCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Service Baru
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Service</TableHead>
              <TableHead>Kategori</TableHead> {/* Kolom Baru */}
              <TableHead>Harga</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialServices.map((svc) => (
              <TableRow key={svc.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    {svc.images?.[0] ? (
                      <div className="relative w-10 h-10 rounded overflow-hidden">
                        <Image
                          src={svc.images[0]}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                        Img
                      </div>
                    )}
                    {svc.name}
                  </div>
                </TableCell>

                {/* MENAMPILKAN KATEGORI */}
                <TableCell>
                  {svc.categories ? (
                    <Badge variant="secondary" className="font-normal">
                      {svc.categories.name}
                    </Badge>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </TableCell>

                <TableCell>
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(svc.price)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{svc.unit}</Badge>
                </TableCell>
                <TableCell>
                  {svc.is_active ? (
                    <Badge className="bg-green-600 hover:bg-green-700">
                      Aktif
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Non-Aktif</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(svc)}
                    >
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(svc.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {initialServices.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6} // Update colspan jadi 6
                  className="text-center py-10 text-gray-500"
                >
                  Belum ada service. Klik tombol tambah.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* DIALOG FORM */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedService ? "Edit Service" : "Tambah Service Baru"}
            </DialogTitle>
            <DialogDescription>
              Isi detail layanan di bawah ini. Klik simpan untuk perubahan.
            </DialogDescription>
          </DialogHeader>

          <ServiceForm
            initialData={selectedService}
            onSuccessAction={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
