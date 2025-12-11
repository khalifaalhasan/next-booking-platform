"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Tables } from "@/types/supabase";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  MoreHorizontal,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type BlogCategory = Tables<"blog_categories">;

interface BlogCategoryManagerProps {
  initialCategories: BlogCategory[];
}

export default function BlogCategoryManager({
  initialCategories,
}: BlogCategoryManagerProps) {
  const router = useRouter();
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // State Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<BlogCategory | null>(null);
  const [itemToDelete, setItemToDelete] = useState<BlogCategory | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  // Filter
  const filteredCategories = initialCategories.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  // --- HANDLERS ---

  const resetForm = () => {
    setName("");
    setSlug("");
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (category: BlogCategory) => {
    setName(category.name);
    setSlug(category.slug);
    setItemToEdit(category);
  };

  // Auto Slug Generator
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    // Auto slug hanya jika sedang create atau jika user belum edit slug manual
    if (!itemToEdit) {
      const newSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(newSlug);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      toast.error("Nama dan Slug wajib diisi");
      return;
    }
    setLoading(true);

    try {
      const payload = { name, slug };

      if (itemToEdit) {
        // UPDATE
        const { error } = await supabase
          .from("blog_categories")
          .update(payload)
          .eq("id", itemToEdit.id);
        if (error) throw error;
        toast.success("Kategori diperbarui");
      } else {
        // CREATE
        const { error } = await supabase
          .from("blog_categories")
          .insert(payload);
        if (error) throw error;
        toast.success("Kategori dibuat");
      }

      router.refresh();
      setIsCreateOpen(false);
      setItemToEdit(null);
      resetForm();
    } catch (err: unknown) {
        let msg = "Gagal menyimpan";
        if(err instanceof Error) msg = err.message;
        // Handle duplicate slug error unique constraint
        if(msg.includes("duplicate key")) msg = "Slug sudah digunakan, ganti yang lain.";
        
        toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("blog_categories")
        .delete()
        .eq("id", itemToDelete.id);

      if (error) throw error;

      toast.success("Kategori dihapus");
      router.refresh();
      setItemToDelete(null);
    } catch (err) {
      toast.error("Gagal menghapus kategori");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          onClick={handleOpenCreate}
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah Kategori
        </Button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Nama Kategori</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-slate-400">
                  Tidak ada kategori ditemukan.
                </td>
              </tr>
            ) : (
              filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {cat.name}
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                    /{cat.slug}
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
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleOpenEdit(cat)}
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                          onClick={() => setItemToDelete(cat)}
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

      {/* --- DIALOG CREATE / EDIT (Satu Modal untuk Keduanya) --- */}
      <Dialog
        open={isCreateOpen || !!itemToEdit}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setItemToEdit(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {itemToEdit ? "Edit Kategori" : "Tambah Kategori Baru"}
            </DialogTitle>
            <DialogDescription>
              Buat kategori untuk mengelompokkan artikel blog.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama Kategori</Label>
              <Input
                placeholder="Contoh: Tips & Trik"
                value={name}
                onChange={handleNameChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Slug URL</Label>
              <Input
                placeholder="tips-trik"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
              <p className="text-[10px] text-slate-400">
                Slug akan digunakan di URL browser. Harus unik.
              </p>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  setItemToEdit(null);
                }}
                disabled={loading}
              >
                Batal
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : itemToEdit ? (
                  "Simpan Perubahan"
                ) : (
                  "Buat Kategori"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- DIALOG DELETE --- */}
      <Dialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto bg-red-100 p-3 rounded-full mb-2 w-fit">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="text-center">Hapus Kategori?</DialogTitle>
            <DialogDescription className="text-center">
              Anda akan menghapus <strong>{itemToDelete?.name}</strong>.<br />
              Artikel yang menggunakan kategori ini mungkin akan kehilangan labelnya.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2 mt-2">
            <Button variant="outline" onClick={() => setItemToDelete(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Menghapus..." : "Ya, Hapus Permanen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}