import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// 1. Helper Wajib Shadcn UI (Menggabungkan class tailwind)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 2. Format Rupiah (Rp 1.000.000)
export function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// 3. Format Tanggal Indonesia (Senin, 20 Nov 2025)
export function formatDateIndo(
  date: string | Date | null | undefined,
  pattern: string = "EEE, dd MMM yyyy"
) {
  if (!date) return "-";
  try {
    return format(new Date(date), pattern, { locale: id });
  } catch (error) {
    return "-";
  }
}

// 4. Format Jam (14:00 WIB)
export function formatTimeIndo(date: string | Date | null | undefined) {
  if (!date) return "-";
  try {
    return format(new Date(date), "HH:mm", { locale: id }) + " WIB";
  } catch (error) {
    return "-";
  }
}

// 5. Generator Inisial (Budi Santoso -> BS)
export function getInitials(name: string = "", email: string = "") {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  return email.substring(0, 2).toUpperCase() || "U";
}
