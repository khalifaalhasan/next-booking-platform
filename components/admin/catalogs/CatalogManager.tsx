"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  FileText,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

import CatalogForm from "./CatalogForm";
import { Tables } from "@/types/supabase";

type Catalog = Tables<"catalogs">;

interface CatalogManagerProps {
  initialData: Catalog[];
}

export default function CatalogManager({ initialData }: CatalogManagerProps) {
  const router = useRouter();
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Catalog | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Catalog | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- LOGIKA SEARCH (DIPERBARUI) ---
  const filteredData = initialData.filter((item) => {
    const query = search.toLowerCase();
    const titleMatch = (item.title || "").toLowerCase().includes(query);
    const descMatch = (item.description || "").toLowerCase().includes(query);

    // Tampilkan jika cocok dengan Judul ATAU Deskripsi
    return titleMatch || descMatch;
  });

  // Handle Delete
  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from("catalogs")
        .delete()
        .eq("id", itemToDelete.id);

      if (error) throw error;

      toast.success("Katalog berhasil dihapus");
      router.refresh();
      setItemToDelete(null);
    } catch (err) {
      toast.error("Gagal menghapus katalog");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari judul atau deskripsi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" /> Upload Katalog
        </Button>
      </div>

      {/* GRID LIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredData.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
            <div className="flex justify-center mb-3">
              {/* Icon Search X jika sedang mencari tapi tidak ketemu */}
              {search ? (
                <Search className="w-12 h-12 opacity-20" />
              ) : (
                <FileText className="w-12 h-12 opacity-20" />
              )}
            </div>
            <p>
              {search
                ? `Tidak ditemukan katalog dengan kata kunci "${search}"`
                : "Belum ada katalog yang diupload."}
            </p>
          </div>
        ) : (
          filteredData.map((item) => (
            <Card
              key={item.id}
              className="group overflow-hidden border-slate-200 hover:shadow-md transition flex flex-col"
            >
              {/* THUMBNAIL AREA */}
              <div className="relative aspect-[3/4] bg-slate-100 border-b border-slate-100 overflow-hidden">
                {item.thumbnail_url ? (
                  <Image
                    src={item.thumbnail_url}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-300">
                    <FileText className="w-16 h-16" />
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  {item.is_active ? (
                    <Badge className="bg-green-500/90 hover:bg-green-600 text-white shadow-sm backdrop-blur-sm border-0">
                      Aktif
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-slate-900/50 text-white backdrop-blur-sm border-0"
                    >
                      Draft
                    </Badge>
                  )}
                </div>

                {/* Overlay Action Buttons */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <Link href={item.pdf_url} target="_blank">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full"
                      title="Lihat PDF"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setItemToEdit(item)}
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setItemToDelete(item)}
                    title="Hapus"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* INFO AREA */}
              <div className="p-4 flex flex-col flex-1">
                <h3
                  className="font-bold text-slate-800 line-clamp-2 leading-tight mb-1"
                  title={item.title}
                >
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {item.description}
                  </p>
                )}
                <div className="mt-auto text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-50">
                  Diupdate:{" "}
                  {item.updated_at
                    ? new Date(item.updated_at).toLocaleDateString("id-ID")
                    : "-"}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* MODAL CREATE */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload Katalog Baru</DialogTitle>
            <DialogDescription>
              Format PDF wajib diisi. Gambar cover opsional.
            </DialogDescription>
          </DialogHeader>
          <CatalogForm onSuccessAction={() => setIsCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* MODAL EDIT */}
      <Dialog
        open={!!itemToEdit}
        onOpenChange={(open) => !open && setItemToEdit(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Katalog</DialogTitle>
          </DialogHeader>
          <CatalogForm
            initialData={itemToEdit}
            onSuccessAction={() => setItemToEdit(null)}
          />
        </DialogContent>
      </Dialog>

      {/* MODAL DELETE */}
      <Dialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto bg-red-100 p-3 rounded-full mb-2 w-fit">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="text-center">Hapus Katalog?</DialogTitle>
            <DialogDescription className="text-center">
              Anda akan menghapus <strong>{itemToDelete?.title}</strong>.<br />
              File PDF akan dihapus dan tidak bisa dikembalikan.
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
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
