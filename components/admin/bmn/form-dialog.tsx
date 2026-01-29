"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bmnSchema, BmnFormValues } from "@/lib/schemas/bmn-schema";
import { createBmn, updateBmn } from "@/actions/bmn-action";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tables } from "@/types/supabase";

interface BmnFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Tables<"bmn_records"> | null;
}

export default function BmnFormDialog({
  open,
  onOpenChange,
  initialData,
}: BmnFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- PERBAIKAN 1: Hapus Generic <BmnFormValues> ---
  // Biarkan useForm meng-infer tipe langsung dari resolver.
  // Ini biasanya menghilangkan error "Type Resolver is not assignable..."
  const form = useForm({
    resolver: zodResolver(bmnSchema),
    defaultValues: {
      kode_barang: "",
      uraian_barang: "",
      nup: "",
      tahun_perolehan: new Date().getFullYear(),
      merek_tipe: "",
      kuantitas: 1,
      satuan: "Unit",
      nilai_perolehan: 0,
      kondisi: "Baik",
      lokasi: "",
      bukti_kepemilikan: "",
      keterangan: "",
    },
  });

  // --- PERBAIKAN 2: Sanitasi Data (Null vs Undefined) ---
  useEffect(() => {
    if (open) {
      if (initialData) {
        // Supabase mengembalikan null, Form butuh string kosong ("") atau undefined.
        // Kita paksa casting satu per satu untuk keamanan tipe.
        form.reset({
          kode_barang: initialData.kode_barang,
          uraian_barang: initialData.uraian_barang,
          nup: initialData.nup || "", // null jadi ""
          tahun_perolehan: Number(initialData.tahun_perolehan),
          merek_tipe: initialData.merek_tipe || "",
          kuantitas: Number(initialData.kuantitas),
          satuan: initialData.satuan || "Unit",
          nilai_perolehan: Number(initialData.nilai_perolehan),
          kondisi:
            (initialData.kondisi as "Baik" | "Rusak Ringan" | "Rusak Berat") ||
            "Baik",
          lokasi: initialData.lokasi || "",
          bukti_kepemilikan: initialData.bukti_kepemilikan || "",
          keterangan: initialData.keterangan || "",
        });
      } else {
        // Reset ke default untuk Create baru
        form.reset({
          kode_barang: "",
          uraian_barang: "",
          nup: "",
          tahun_perolehan: new Date().getFullYear(),
          merek_tipe: "",
          kuantitas: 1,
          satuan: "Unit",
          nilai_perolehan: 0,
          kondisi: "Baik",
          lokasi: "",
          bukti_kepemilikan: "",
          keterangan: "",
        });
      }
    }
  }, [open, initialData, form]);

  // Handle Submit
  // Kita gunakan tipe 'any' sementara pada parameter values agar tidak konflik dengan inferensi,
  // tapi kita validasi ulang saat pembuatan FormData.
  async function onSubmit(values: any) {
    setIsSubmitting(true);

    // Casting values kembali ke BmnFormValues agar kita yakin
    const safeValues = values as BmnFormValues;

    const formData = new FormData();
    Object.entries(safeValues).forEach(([key, value]) => {
      // Pastikan tidak mengirim undefined/null ke FormData
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    try {
      let result;

      if (initialData) {
        result = await updateBmn(initialData.id, formData);
      } else {
        result = await createBmn(null, formData);
      }

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Data BMN" : "Pencatatan BMN Baru"}
          </DialogTitle>
          <DialogDescription>
            Isi formulir Kertas Kerja Inventarisasi (KKI) di bawah ini dengan
            teliti.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* GROUP 1: IDENTITAS BARANG */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">
              <FormField
                control={form.control}
                name="kode_barang"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Barang</FormLabel>
                    <FormControl>
                      <Input placeholder="Cth: 3.01.01.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="uraian_barang"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Uraian Barang (Nama Aset)</FormLabel>
                    <FormControl>
                      <Input placeholder="Cth: Laptop ASUS ROG" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NUP</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="No. Urut Pendaftaran"
                        {...field}
                        value={field.value?.toString() || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="merek_tipe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Merek / Tipe</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Cth: Toyota Avanza 2022"
                        {...field}
                        value={field.value?.toString() || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* GROUP 2: NILAI & KUANTITAS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
              <FormField
                control={form.control}
                name="tahun_perolehan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tahun Perolehan</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value?.toString() || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kuantitas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kuantitas</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        value={field.value?.toString() || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="satuan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Satuan</FormLabel>
                    <FormControl>
                      <Input placeholder="Unit/Set/Buah" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nilai_perolehan"
                render={({ field }) => (
                  <FormItem className="md:col-span-3">
                    <FormLabel>Nilai Perolehan (Rp)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} value={field.value?.toString() || ""} />
                    </FormControl>
                    <p className="text-[10px] text-muted-foreground">
                      Terbaca:{" "}
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(Number(field.value))}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* GROUP 3: KONDISI & LOKASI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="kondisi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kondisi Barang</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Kondisi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Baik">Baik (B)</SelectItem>
                        <SelectItem value="Rusak Ringan">
                          Rusak Ringan (RR)
                        </SelectItem>
                        <SelectItem value="Rusak Berat">
                          Rusak Berat (RB)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lokasi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lokasi / Pengguna</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Cth: Ruang Server / Admin"
                        {...field}
                        value={field.value?.toString() || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bukti_kepemilikan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bukti Kepemilikan</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="No. Sertifikat / BPKB / Faktur"
                        {...field}
                        value={field.value?.toString() || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="keterangan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keterangan Tambahan</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Catatan khusus..."
                        className="resize-none"
                        {...field}
                        value={field.value?.toString() || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Simpan Data
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
