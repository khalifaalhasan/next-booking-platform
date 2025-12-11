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
  Eye,
  AlertTriangle,
  FileText,
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
import Image from "next/image";

import PostForm from "@/components/admin/posts/PostForm";

type Post = Tables<"posts">;

interface PostManagerProps {
  initialPosts: Post[];
}

export default function PostManager({ initialPosts }: PostManagerProps) {
  const router = useRouter();
  const supabase = createClient();

  const [search, setSearch] = useState("");

  // State Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Post | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter
  const filteredPosts = initialPosts.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  // Format Tanggal
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Handle Hapus
  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", itemToDelete.id);
      if (error) throw error;
      toast.success("Artikel berhasil dihapus");
      router.refresh();
      setItemToDelete(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus";
      toast.error(msg);
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
            placeholder="Cari judul artikel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Tulis Artikel Baru
        </Button>
      </div>

      {/* TABLE DESKTOP */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
            <tr>
              <th className="px-6 py-4 w-[80px]">Cover</th>
              <th className="px-6 py-4">Judul Artikel</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4">Tanggal</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  Belum ada artikel.
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="relative w-10 h-10 rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                      {post.thumbnail_url ? (
                        <Image
                          src={post.thumbnail_url}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <FileText className="w-4 h-4 text-slate-300" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 max-w-[300px] truncate">
                    {post.title}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <Badge variant="outline">{post.category}</Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {formatDate(post.created_at)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {post.is_published ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-slate-500">
                        Draft
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
                        <Link href={`/blog/${post.slug}`} target="_blank">
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" /> Preview
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => setItemToEdit(post)}
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Edit Artikel
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                          onClick={() => setItemToDelete(post)}
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

      {/* MOBILE CARD LIST */}
      <div className="md:hidden space-y-4">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <CardHeader className="pb-2 bg-slate-50/50 border-b border-slate-100 p-4">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <CardTitle className="text-base font-bold text-slate-900 line-clamp-2">
                    {post.title}
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-1">
                    {post.category} • {formatDate(post.created_at)}
                  </p>
                </div>
                {post.is_published ? (
                  <Badge className="bg-green-100 text-green-700 text-[10px] shrink-0">
                    Pub
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    Draft
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardFooter className="border-t border-slate-100 p-2 grid grid-cols-3 gap-2 bg-slate-50/30">
              <Link href={`/blog/${post.slug}`} className="w-full">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs h-8"
                >
                  <Eye className="w-3 h-3 mr-1.5" /> Lihat
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-8"
                onClick={() => setItemToEdit(post)}
              >
                <Pencil className="w-3 h-3 mr-1.5" /> Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="w-full text-xs h-8"
                onClick={() => setItemToDelete(post)}
              >
                <Trash2 className="w-3 h-3 mr-1.5" /> Hapus
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* DIALOG CREATE */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-4xl p-6 overflow-hidden">
          <DialogHeader>
            <DialogTitle>Tulis Artikel Baru</DialogTitle>
            <DialogDescription>
              Buat konten menarik untuk blog website.
            </DialogDescription>
          </DialogHeader>
          <PostForm
            initialData={null}
            onSuccessAction={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* DIALOG EDIT */}
      <Dialog
        open={!!itemToEdit}
        onOpenChange={(open) => !open && setItemToEdit(null)}
      >
        <DialogContent className="sm:max-w-4xl p-6 overflow-hidden">
          <DialogHeader>
            <DialogTitle>Edit Artikel</DialogTitle>
            <DialogDescription>Perbarui konten artikel.</DialogDescription>
          </DialogHeader>
          <PostForm
            initialData={itemToEdit}
            onSuccessAction={() => setItemToEdit(null)}
          />
        </DialogContent>
      </Dialog>

      {/* DIALOG DELETE */}
      <Dialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto bg-red-100 p-3 rounded-full mb-2 w-fit">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="text-center">Hapus Artikel?</DialogTitle>
            <DialogDescription className="text-center">
              Anda akan menghapus <strong>{itemToDelete?.title}</strong>.{" "}
              <br />
              Tindakan ini permanen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2 mt-2">
            <Button variant="outline" onClick={() => setItemToDelete(null)}>
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
