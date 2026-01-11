"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// Pastikan path ini benar sesuai nama file kamu (sop.ts atau sop-actions.ts)
import { SopRow } from "@/actions/sop-actions";
import { deleteSop } from "@/actions/sop-actions";
import SopForm from "./sop-form";

// UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/formatters";

// 👇 FIX 1: Interface disesuaikan. Manager butuh Array, bukan single row.
interface SopManagerProps {
  data: SopRow[];
}

export default function AdminSopManager({ data }: SopManagerProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  // State Dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSop, setEditingSop] = useState<SopRow | null>(null);
  const [deletingSop, setDeletingSop] = useState<SopRow | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // Filter Data Safe Check
  const filteredData = data.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deletingSop) return;

    const res = await deleteSop(deletingSop.id, deletingSop.file_path);
    if (res.success) {
      toast.success("SOP berhasil dihapus");
      setDeletingSop(null);
    } else {
      toast.error("Gagal menghapus SOP");
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Tools */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari SOP..."
            className="pl-9"
            value={search}
            onChange={handleSearch}
          />
        </div>

        {/* CREATE DIALOG */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Tambah SOP
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah SOP Baru</DialogTitle>
            </DialogHeader>
            {/* onSuccess ditambahkan agar dialog nutup pas save */}
            <SopForm onSuccess={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* 2. Admin Table */}
      <div className="rounded-md border bg-white dark:bg-slate-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Ukuran</TableHead>
              <TableHead>Tanggal Dibuat</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center h-24 text-muted-foreground"
                >
                  Data tidak ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((sop) => (
                <TableRow key={sop.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{sop.title}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {sop.description || "-"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {sop.file_size
                      ? (sop.file_size / 1024 / 1024).toFixed(2) + " MB"
                      : "-"}
                  </TableCell>
                  {/* 👇 FIX 2: Menghapus updated_at dan memberi null check pada created_at */}
                  <TableCell>
                    {sop.created_at ? formatDate(sop.created_at) : "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingSop(sop)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => setDeletingSop(sop)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 3. EDIT DIALOG */}
      <Dialog
        open={!!editingSop}
        onOpenChange={(open) => !open && setEditingSop(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit SOP</DialogTitle>
          </DialogHeader>
          {editingSop && (
            <SopForm
              initialData={editingSop}
              onSuccess={() => setEditingSop(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 4. DELETE ALERT */}
      <AlertDialog
        open={!!deletingSop}
        onOpenChange={(open) => !open && setDeletingSop(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus SOP ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. File PDF dan data akan
              dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
