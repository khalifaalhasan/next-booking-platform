"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  Calendar,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
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
import EventForm from "./EventForm";
import { Tables } from "@/types/supabase";

type Event = Tables<"events">;

export default function EventManager({
  initialData,
}: {
  initialData: Event[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Event | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredData = initialData.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", itemToDelete.id);
      if (error) throw error;
      toast.success("Event dihapus");
      router.refresh();
      setItemToDelete(null);
    } catch (err) {
      toast.error("Gagal menghapus");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" /> Buat Event Baru
        </Button>
      </div>

      {/* Grid Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((item) => (
          <Card
            key={item.id}
            className="group overflow-hidden flex flex-col hover:shadow-md transition"
          >
            <div className="relative h-48 bg-slate-100">
              {item.thumbnail_url ? (
                <Image
                  src={item.thumbnail_url}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-300">
                  <Calendar className="w-12 h-12" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge
                  className={item.is_active ? "bg-green-500" : "bg-slate-500"}
                >
                  {item.is_active ? "Aktif" : "Draft"}
                </Badge>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <div className="text-xs text-blue-600 font-semibold mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {item.event_date
                  ? new Date(item.event_date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Tanggal belum diatur"}
              </div>

              <h3 className="font-bold text-lg mb-2 line-clamp-2">
                {item.title}
              </h3>

              <div className="text-xs text-slate-500 mb-4 flex items-center gap-1">
                <MapPin className="w-3 h-3" />{" "}
                {item.location || "Lokasi Online/Belum diatur"}
              </div>

              <div className="mt-auto flex gap-2 pt-4 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setItemToEdit(item)}
                >
                  <Pencil className="w-3 h-3 mr-2" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="px-3"
                  onClick={() => setItemToDelete(item)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Dialogs */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Buat Event Baru</DialogTitle>
          </DialogHeader>
          <EventForm onSuccessAction={() => setIsCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!itemToEdit}
        onOpenChange={(open) => !open && setItemToEdit(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <EventForm
            initialData={itemToEdit}
            onSuccessAction={() => setItemToEdit(null)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Event?</DialogTitle>
            <DialogDescription>
              Data {itemToDelete?.title} akan dihapus permanen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setItemToDelete(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
