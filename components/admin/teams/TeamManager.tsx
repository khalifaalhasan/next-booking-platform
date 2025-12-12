"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Plus, Pencil, Trash2, MoreHorizontal, User } from "lucide-react";
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
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

// Import Form Child
import TeamForm from "./TeamForm";

// Definisi tipe data (Harus sama strukturnya dengan Child)
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

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<TeamMember | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus anggota tim ini? Tindakan ini permanen.")) return;

    const { error } = await supabase.from("teams").delete().eq("id", id);

    if (error) {
      toast.error("Gagal menghapus data");
    } else {
      toast.success("Data berhasil dihapus");
      router.refresh();
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
                {/* FIX TAILWIND: pl-[4rem] diubah menjadi pl-16 */}
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
                      <DropdownMenuItem
                        onClick={() => handleDelete(member.id)}
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
    </div>
  );
}
