"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  User,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

// Import Form Child
import TeamForm from "./TeamForm";

// Definisi tipe data
interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

// Parent menerima props 'initialTeams'
export default function TeamManager({
  initialTeams,
}: {
  initialTeams: TeamMember[];
}) {
  const router = useRouter();
  const supabase = createClient();

  // State untuk Create & Edit
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<TeamMember | null>(null);

  // State untuk Delete (Modal)
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<TeamMember | null>(null);

  // Fungsi Eksekusi Hapus (Dipanggil dari Modal)
  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from("teams")
        .delete()
        .eq("id", itemToDelete.id);

      if (error) throw error;

      toast.success("Data berhasil dihapus");
      router.refresh();
      setItemToDelete(null); // Tutup modal setelah sukses
    } catch (error) {
      toast.error("Gagal menghapus data");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="font-bold text-slate-700 text-lg">Daftar Pimpinan</h2>
          <p className="text-xs text-slate-500">Kelola struktur organisasi</p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Anggota
        </Button>
      </div>

      {/* LIST CONTENT */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {initialTeams.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400">
            <User className="w-12 h-12 mb-3 opacity-20" />
            <p>Belum ada data tim.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {initialTeams.map((member) => (
              <div
                key={member.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition gap-4"
              >
                {/* Info User */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 rounded-lg border border-slate-200 bg-slate-50">
                    <AvatarImage
                      src={member.image_url || ""}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-lg bg-slate-100 text-slate-400">
                      <User className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-slate-900 leading-tight">
                      {member.name}
                    </p>
                    <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mt-1">
                      {member.position}
                    </p>
                  </div>
                </div>

                {/* Info Tambahan & Aksi */}
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pl-16 sm:pl-0">
                  <div className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                    Urutan: {member.sort_order}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-slate-200"
                      >
                        <MoreHorizontal className="w-4 h-4 text-slate-600" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setItemToEdit(member)}
                        className="cursor-pointer"
                      >
                        <Pencil className="w-4 h-4 mr-2" /> Edit Data
                      </DropdownMenuItem>

                      {/* BUTTON HAPUS: Hanya trigger setItemToDelete */}
                      <DropdownMenuItem
                        onClick={() => setItemToDelete(member)}
                        className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Hapus Data
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- DIALOG CREATE --- */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tambah Anggota Tim</DialogTitle>
          </DialogHeader>
          <TeamForm onSuccess={() => setIsCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* --- DIALOG EDIT --- */}
      <Dialog
        open={!!itemToEdit}
        onOpenChange={(isOpen) => !isOpen && setItemToEdit(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Anggota Tim</DialogTitle>
          </DialogHeader>
          <TeamForm
            initialData={itemToEdit}
            onSuccess={() => setItemToEdit(null)}
          />
        </DialogContent>
      </Dialog>

      {/* --- DIALOG DELETE CONFIRMATION --- */}
      <Dialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto bg-red-100 p-3 rounded-full mb-2 w-fit">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="text-center">
              Hapus Anggota Ini?
            </DialogTitle>
            <DialogDescription className="text-center">
              Anda akan menghapus <strong>{itemToDelete?.name}</strong>. <br />
              Tindakan ini permanen dan tidak dapat dikembalikan.
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
