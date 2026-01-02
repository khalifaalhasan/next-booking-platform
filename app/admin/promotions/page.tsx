"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Megaphone } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PageHeader from "@/components/admin/AdminPageheader";
// Pastikan path import ini sesuai dengan lokasi file PromotionManager Anda
// Jika Anda membuatnya di folder dashboard, ganti 'admin' dengan 'dashboard'
import PromotionManager from "@/components/admin/promotions/PromotionManager";
import { Database } from "@/types/supabase";

type Promotion = Database["public"]["Tables"]["promotions"]["Row"];

export default function AdminPromotionsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  // 1. Fungsi Fetch Data
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;

      setPromotions(data || []);
    } catch (error: unknown) {
      let errorMessage = "Gagal mengambil data promosi";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        errorMessage = String((error as { message: unknown }).message);
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch saat pertama kali load
  useEffect(() => {
    fetchPromotions();
  }, []);

  return (
    <>
      <PageHeader
        title="Manajemen Promosi"
        description="Kelola banner promosi yang tampil di halaman depan website."
      />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-blue-600" />
              <CardTitle>Daftar Banner Aktif</CardTitle>
            </div>
            <CardDescription>
              Anda dapat menambah, mengedit, atau menonaktifkan banner promosi
              di sini.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                <span className="ml-2 text-slate-500">Memuat data...</span>
              </div>
            ) : (
              // --- UPDATE DISINI: Tambahkan onRefresh ---
              <PromotionManager
                initialData={promotions}
                onRefresh={fetchPromotions} // <-- Ini sumber airnya
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
