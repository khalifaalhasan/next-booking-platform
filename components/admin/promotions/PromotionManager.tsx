"use client";

import { useState } from "react";
import PromotionsList from "./PromotionList";
import PromotionForm from "./PromotionForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Database } from "@/types/supabase";

type Promotion = Database["public"]["Tables"]["promotions"]["Row"];

interface PromotionManagerProps {
  initialData: Promotion[];
  onRefresh?: () => void; // <--- INI FUNGSI REFRESH DARI PAGE.TSX
}

export default function PromotionManager({ initialData, onRefresh }: PromotionManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  // Handle Buka Modal Create
  const handleOpenCreate = () => {
    setEditingPromo(null);
    setIsModalOpen(true);
  };

  // Handle Buka Modal Edit
  const handleOpenEdit = (promo: Promotion) => {
    setEditingPromo(promo);
    setIsModalOpen(true);
  };

  // Handle Sukses (Create/Update)
  const handleSuccess = () => {
    setIsModalOpen(false);
    setEditingPromo(null);
    // Panggil refresh setelah sukses simpan
    if (onRefresh) onRefresh(); 
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Promo Baru
        </Button>
      </div>

      {/* --- BAGIAN INI YANG SERING SALAH/LUPA --- */}
      <PromotionsList 
        initialData={initialData} 
        onEdit={handleOpenEdit}
        onRefresh={onRefresh}  // <--- PASTIKAN INI ADA! JANGAN LUPA DIPASANG!
      />
      {/* --------------------------------------- */}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
                {editingPromo ? "Edit Promosi" : "Buat Promosi Baru"}
            </DialogTitle>
            <DialogDescription>
                {editingPromo ? "Ubah detail banner promosi di bawah ini." : "Isi form di bawah untuk menambahkan banner baru."}
            </DialogDescription>
          </DialogHeader>
          
          <PromotionForm 
            key={editingPromo?.id || 'new'} 
            initialData={editingPromo}
            onCancel={() => setIsModalOpen(false)}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}