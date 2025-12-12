// src/components/dashboard/RecentBookingTable.tsx
import React from "react";
import { MoreHorizontal, Calendar, User, Phone } from "lucide-react";
import { format } from "date-fns"; // Optional: jika ingin format tanggal mudah, atau pakai Intl
import { id } from "date-fns/locale"; // Locale Indonesia

// Kita definisikan tipe data yang diharapkan komponen ini
// Menggunakan tipe dari database tapi yang sudah di-join
interface BookingRow {
  id: string;
  customer_name: string | null;
  start_time: string;
  status: string;
  services: {
    name: string;
  } | null;
  profiles: {
    full_name: string | null;
    phone_number: string | null;
  } | null;
}

interface RecentBookingTableProps {
  bookings: BookingRow[];
}

export const RecentBookingTable = ({ bookings }: RecentBookingTableProps) => {
  // Helper untuk format tanggal
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Helper warna badge status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting_verification":
      case "pending_payment":
        return "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20";
      case "confirmed":
      case "completed":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20";
      case "cancelled":
        return "bg-red-50 text-red-700 ring-1 ring-red-600/20";
      default:
        return "bg-slate-50 text-slate-700 ring-1 ring-slate-600/20";
    }
  };

  return (
    <div className="col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h3 className="font-bold text-slate-800">Booking Masuk Terbaru</h3>
          <p className="text-xs text-slate-500">5 Permintaan terakhir</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-6 py-3 font-semibold">Pemohon</th>
              <th className="px-6 py-3 font-semibold">Layanan</th>
              <th className="px-6 py-3 font-semibold">Tanggal</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">
                  Belum ada data booking.
                </td>
              </tr>
            ) : (
              bookings.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-6 py-3">
                    <div className="font-medium text-slate-700">
                      {/* Prioritas nama: Dari Profile (User Login) -> Dari Input Manual -> 'Guest' */}
                      {item.profiles?.full_name ||
                        item.customer_name ||
                        "Guest"}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Phone size={10} />
                      {item.profiles?.phone_number || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    {item.services?.name || "Layanan Dihapus"}
                  </td>
                  <td className="px-6 py-3 text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} /> {formatDate(item.start_time)}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button className="text-slate-400 hover:text-slate-600">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
