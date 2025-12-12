"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Tables } from "@/types/supabase";
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
import TeamForm from "./TeamForm";
import { toast } from "sonner";

export default function TeamManager({
  initialTeams,
}: {
  initialTeams: Tables<"teams">[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Tables<"teams"> | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus anggota tim ini?")) return;
    const { error } = await supabase.from("teams").delete().eq("id", id);
    if (error) toast.error("Gagal menghapus");
    else {
      toast.success("Berhasil dihapus");
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <h2 className="font-bold text-slate-700">Daftar Pimpinan</h2>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Anggota
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {initialTeams.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            Belum ada data tim.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {initialTeams.map((member) => (
              <div
                key={member.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 rounded-lg border border-slate-200">
                    <AvatarImage
                      src={member.image_url || ""}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-lg">
                      <User className="w-6 h-6 text-slate-400" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-slate-900">{member.name}</p>
                    <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">
                      {member.position}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
                    Urutan: {member.sort_order}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setItemToEdit(member)}>
                        <Pencil className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(member.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DIALOGS */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Anggota Tim</DialogTitle>
          </DialogHeader>
          <TeamForm onSuccessAction={() => setIsCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!itemToEdit}
        onOpenChange={(o) => !o && setItemToEdit(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Anggota Tim</DialogTitle>
          </DialogHeader>
          <TeamForm
            initialData={itemToEdit}
            onSuccessAction={() => setItemToEdit(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
